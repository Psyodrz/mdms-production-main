import { getAdminClient, getSupabaseClient } from '../_shared/client.ts'
import { ok, err, handleOptions } from '../_shared/response.ts'
import { getUserFromRequest, requireRole } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  const optionRes = handleOptions(req)
  if (optionRes) return optionRes

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'list'
    const adminSupabase = getAdminClient()

    // 1. PUBLIC ENDPOINTS
    if (req.method === 'GET' && action === 'list') {
      const search = url.searchParams.get('search')
      const location = url.searchParams.get('location')

      let query = adminSupabase
        .from('TalentProfile')
        .select('*, user:User(firstName, lastName, avatarUrl)')
        .eq('status', 'ACTIVE')

      if (location) {
        query = query.ilike('city', `%${location}%`)
      }

      const { data, error } = await query
      if (error) throw error

      let filtered = data || []
      if (search) {
        const searchLower = search.toLowerCase()
        filtered = filtered.filter(
          (p: any) =>
            (p.bio && p.bio.toLowerCase().includes(searchLower)) ||
            (p.user && p.user.firstName && p.user.firstName.toLowerCase().includes(searchLower)) ||
            (p.user && p.user.lastName && p.user.lastName.toLowerCase().includes(searchLower))
        )
      }

      return ok(filtered)
    }

    if (req.method === 'GET' && action === 'featured') {
      const { data, error } = await adminSupabase
        .from('TalentProfile')
        .select('*, user:User(firstName, lastName, avatarUrl)')
        .eq('status', 'ACTIVE')
        .order('profileViews', { ascending: false })
        .limit(4)
      if (error) throw error
      return ok(data)
    }

    if (req.method === 'GET' && action === 'get') {
      const id = url.searchParams.get('id')
      if (!id) return err('Profile ID or Slug is required')

      // Query by ID or Slug
      const { data: profile, error } = await adminSupabase
        .from('TalentProfile')
        .select(`
          *,
          user:User(firstName, lastName, avatarUrl),
          userTalents:UserTalent(category:TalentCategory(*)),
          socialLinks:SocialLink(*),
          userLanguages:UserLanguage(language:Language(*)),
          userSkills:UserSkill(skill:Skill(*))
        `)
        .or(`id.eq.${id},slug.eq.${id}`)
        .maybeSingle()

      if (error) throw error
      if (!profile) return err('Talent profile not found', 404)

      return ok(profile)
    }

    if (req.method === 'POST' && action === 'hire') {
      const id = url.searchParams.get('id')
      if (!id) return err('Talent Profile ID is required')
      const body = await req.json()

      const { data, error } = await adminSupabase
        .from('HireRequest')
        .insert({
          talentId: id,
          requesterName: body.requesterName,
          requesterPhone: body.requesterPhone,
          requesterEmail: body.requesterEmail,
          projectType: body.projectType,
          city: body.city,
          dateNeeded: body.dateNeeded,
          budgetRange: body.budgetRange,
          briefDescription: body.briefDescription,
          status: 'NEW',
          trackingSlug: `hire-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        })
        .select()
        .single()

      if (error) throw error
      return ok(data)
    }

    // 2. AUTHENTICATED ENDPOINTS (Requires User Login)
    const user = await getUserFromRequest(req)

    if (req.method === 'GET' && action === 'me') {
      const { data: profile, error } = await adminSupabase
        .from('TalentProfile')
        .select(`
          *,
          user:User(*),
          userTalents:UserTalent(*),
          userLanguages:UserLanguage(language:Language(*)),
          userSkills:UserSkill(skill:Skill(*)),
          socialLinks:SocialLink(*),
          portfolioMedia:PortfolioMedia(*),
          pricing:TalentPricing(*),
          availability:TalentAvailability(*),
          hireRequests:HireRequest(*),
          castingApplications:CastingApplication(castingCall:CastingCall(*))
        `)
        .eq('userId', user.id)
        .maybeSingle()

      if (error) throw error
      if (!profile) return err('Talent profile not found', 404)

      return ok(profile)
    }

    if (req.method === 'PATCH' && action === 'me') {
      const body = await req.json()
      const { data, error } = await adminSupabase
        .from('TalentProfile')
        .update(body)
        .eq('userId', user.id)
        .select()
        .single()

      if (error) throw error
      return ok(data)
    }

    if (req.method === 'POST' && action === 'draft') {
      const body = await req.json()
      const { currentStep, wizardData } = body

      // Upsert draft profile
      const { data, error } = await adminSupabase
        .from('TalentProfile')
        .upsert({
          userId: user.id,
          slug: `draft-${user.id}-${Date.now()}`,
          status: 'DRAFT',
          onboardingStep: currentStep,
          draftData: wizardData,
        }, { onConflict: 'userId' })
        .select()
        .single()

      if (error) throw error
      return ok(data)
    }

    if (req.method === 'POST' && action === 'submit') {
      const body = await req.json()
      const {
        primaryTalentId, secondaryTalentIds, attributes,
        bio, stageName, experienceLevel,
        profilePhotoPreview, coverBannerPreview, introductionVideoPreview,
        resumeName, compCardName, galleryImages,
        achievements, education, brandsWorkedWith,
        instagram, youtube, linkedin, portfolio,
      } = body

      const slug = stageName ? stageName.toLowerCase().replace(/\s+/g, '-') : `talent-${Date.now()}`

      // Upsert profile
      const { data: profile, error } = await adminSupabase
        .from('TalentProfile')
        .upsert({
          userId: user.id,
          slug,
          bio,
          stageName,
          experienceLevel,
          status: 'PENDING_REVIEW',
          onboardingStep: 7,
          onboardingCompleted: true,
          coverBannerUrl: coverBannerPreview,
          introductionVideoUrl: introductionVideoPreview,
          resumeUrl: resumeName ? `documents/${resumeName}` : null,
          compCardUrl: compCardName ? `documents/${compCardName}` : null,
          achievements: achievements || null,
          education: education || null,
          brandsWorkedWith,
          draftData: null,
        }, { onConflict: 'userId' })
        .select()
        .single()

      if (error) throw error

      // Clean and recreate UserTalents
      await adminSupabase.from('UserTalent').delete().eq('talentProfileId', profile.id)

      const categoryInserts = []
      if (primaryTalentId) {
        categoryInserts.push({
          talentProfileId: profile.id,
          categoryId: primaryTalentId,
          isPrimary: true,
          attributes: attributes || {},
        })
      }
      if (secondaryTalentIds && Array.isArray(secondaryTalentIds)) {
        secondaryTalentIds.forEach((catId) => {
          categoryInserts.push({
            talentProfileId: profile.id,
            categoryId: catId,
            isPrimary: false,
            attributes: {},
          })
        })
      }
      if (categoryInserts.length > 0) {
        const { error: catError } = await adminSupabase.from('UserTalent').insert(categoryInserts)
        if (catError) throw catError
      }

      // Clean and recreate Social Links
      await adminSupabase.from('SocialLink').delete().eq('talentProfileId', profile.id)

      const socialLinks = []
      if (instagram) socialLinks.push({ talentProfileId: profile.id, platform: 'INSTAGRAM', url: instagram })
      if (youtube) socialLinks.push({ talentProfileId: profile.id, platform: 'YOUTUBE', url: youtube })
      if (linkedin) socialLinks.push({ talentProfileId: profile.id, platform: 'LINKEDIN', url: linkedin })
      if (portfolio) socialLinks.push({ talentProfileId: profile.id, platform: 'WEBSITE', url: portfolio })

      if (socialLinks.length > 0) {
        const { error: socErr } = await adminSupabase.from('SocialLink').insert(socialLinks)
        if (socErr) throw socErr
      }

      return ok(profile)
    }

    // 3. ADMIN-ONLY ENDPOINTS
    requireRole(user, ['ADMIN', 'SUPER_ADMIN'])

    if (req.method === 'GET' && action === 'pending') {
      const { data, error } = await adminSupabase
        .from('TalentProfile')
        .select('*, user:User(*)')
        .eq('status', 'PENDING_REVIEW')
        .order('createdAt', { ascending: false })

      if (error) throw error
      return ok(data)
    }

    if (req.method === 'PATCH' && action === 'moderate') {
      const id = url.searchParams.get('id')
      if (!id) return err('Profile ID is required')
      const body = await req.json()
      const { status, reviewNote } = body

      const { data, error } = await adminSupabase
        .from('TalentProfile')
        .update({
          status,
          reviewNote,
          approvedAt: status === 'ACTIVE' ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return ok(data)
    }

    return err('Invalid route or method')
  } catch (error: any) {
    return err(error.message, 500)
  }
})
