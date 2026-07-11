import { getAdminClient } from '../_shared/client.ts'
import { ok, err, handleOptions } from '../_shared/response.ts'

Deno.serve(async (req) => {
  const optionRes = handleOptions(req)
  if (optionRes) return optionRes

  try {
    const url = new URL(req.url)
    const segments = url.pathname.split('/').filter(Boolean)
    const resource = segments[segments.length - 1] || url.searchParams.get('resource')

    if (!resource) {
      return err('Resource type not specified')
    }

    const supabase = getAdminClient()
    let query = null

    switch (resource) {
      case 'portfolio':
        query = supabase
          .from('PortfolioItem')
          .select('*')
          .eq('isPublished', true)
          .is('deletedAt', null)
          .order('sortOrder', { ascending: true })
        break
      case 'services':
        query = supabase
          .from('Service')
          .select('*')
          .eq('isActive', true)
          .is('deletedAt', null)
          .order('sortOrder', { ascending: true })
        break
      case 'team':
        query = supabase
          .from('TeamMember')
          .select('*')
          .eq('isPublished', true)
          .is('deletedAt', null)
          .order('sortOrder', { ascending: true })
        break
      case 'blog':
        query = supabase
          .from('BlogPost')
          .select('*')
          .eq('status', 'PUBLISHED')
          .is('deletedAt', null)
          .order('publishedAt', { ascending: false })
        break
      case 'testimonials':
        query = supabase
          .from('Testimonial')
          .select('*')
          .eq('isPublished', true)
          .is('deletedAt', null)
          .order('sortOrder', { ascending: true })
        break
      case 'faq':
        query = supabase
          .from('FaqItem')
          .select('*')
          .eq('isPublished', true)
          .is('deletedAt', null)
          .order('sortOrder', { ascending: true })
        break
      case 'announcements':
        query = supabase
          .from('Announcement')
          .select('*')
          .eq('isActive', true)
          .is('deletedAt', null)
          .order('sortOrder', { ascending: true })
        break
      default:
        return err(`Unknown resource type: ${resource}`)
    }

    const limit = url.searchParams.get('limit')
    if (limit) {
      query = query.limit(parseInt(limit, 10))
    }

    const { data, error } = await query
    if (error) throw error

    return ok(data)
  } catch (error: any) {
    return err(error.message, 500)
  }
})
