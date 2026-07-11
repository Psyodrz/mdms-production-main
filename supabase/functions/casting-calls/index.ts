import { getAdminClient } from '../_shared/client.ts'
import { ok, err, handleOptions } from '../_shared/response.ts'
import { getUserFromRequest } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  const optionRes = handleOptions(req)
  if (optionRes) return optionRes

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'list'
    const adminSupabase = getAdminClient()

    // 1. PUBLIC/AUTHENTICATED GET LIST
    if (req.method === 'GET' && action === 'list') {
      let user = null
      try {
        user = await getUserFromRequest(req)
      } catch {
        // Unauthenticated request is treated as guest/public directory
      }

      let query = adminSupabase
        .from('CastingCall')
        .select(`
          *,
          applications:CastingApplication(
            *,
            talent:TalentProfile(
              *,
              user:User(id, firstName, lastName, avatarUrl)
            )
          )
        `)

      const userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'GUEST'

      if (userRole === 'CLIENT') {
        query = query.eq('createdById', user.id)
      } else if (userRole === 'TALENT') {
        query = query.eq('status', 'PUBLISHED')
      } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'PROJECT_MANAGER') {
        // No filter, returns all
      } else {
        // Guests or other roles see only published
        query = query.eq('status', 'PUBLISHED')
      }

      const { data, error } = await query.order('createdAt', { ascending: false })
      if (error) throw error

      return ok(data)
    }

    // 2. CREATE CASTING CALL (CLIENT/ADMIN)
    if (req.method === 'POST' && action === 'create') {
      const user = await getUserFromRequest(req)
      const body = await req.json()

      const { data, error } = await adminSupabase
        .from('CastingCall')
        .insert({
          title: body.title,
          description: body.description,
          projectType: body.projectType,
          city: body.city,
          location: body.location,
          compensationType: body.compensationType,
          compensationDetails: body.compensationDetails,
          slotsAvailable: body.slotsAvailable ?? 1,
          deadline: body.deadline ? new Date(body.deadline).toISOString() : null,
          shootDate: body.shootDate ? new Date(body.shootDate).toISOString() : null,
          status: 'PUBLISHED',
          createdById: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return ok(data)
    }

    // 3. APPLY TO CASTING CALL (TALENT ONLY)
    if (req.method === 'POST' && action === 'apply') {
      const user = await getUserFromRequest(req)
      const body = await req.json()

      const { data: talent, error: talentErr } = await adminSupabase
        .from('TalentProfile')
        .select('id')
        .eq('userId', user.id)
        .single()

      if (talentErr || !talent) {
        return err('Talent profile not found or user is not talent', 403)
      }

      const { data, error } = await adminSupabase
        .from('CastingApplication')
        .insert({
          talentId: talent.id,
          castingCallId: body.castingCallId,
          message: body.message || '',
          status: 'APPLIED',
        })
        .select()
        .single()

      if (error) throw error
      return ok(data)
    }

    return err('Invalid method or action')
  } catch (error: any) {
    return err(error.message, 500)
  }
})
