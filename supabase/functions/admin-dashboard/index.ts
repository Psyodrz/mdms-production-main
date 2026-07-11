import { getAdminClient } from '../_shared/client.ts'
import { ok, err, handleOptions } from '../_shared/response.ts'
import { getUserFromRequest, requireRole } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  const optionRes = handleOptions(req)
  if (optionRes) return optionRes

  try {
    const user = await getUserFromRequest(req)
    requireRole(user, ['ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'])

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'kpis'
    const adminSupabase = getAdminClient()

    // 1. GET KPIs
    if (req.method === 'GET' && action === 'kpis') {
      const [talentRes, contactsRes, paymentsRes, activeProjectsRes, pendingBookingsRes] = await Promise.all([
        adminSupabase.from('User').select('id', { count: 'exact', head: true }).eq('role', 'TALENT'),
        adminSupabase.from('ContactSubmission').select('id', { count: 'exact', head: true }).eq('isRead', false).is('deletedAt', null),
        adminSupabase.from('Payment').select('amount').eq('status', 'COMPLETED'),
        adminSupabase.from('Project').select('id', { count: 'exact', head: true }).not('status', 'in', '("COMPLETED","DELIVERED")'),
        adminSupabase.from('Booking').select('id', { count: 'exact', head: true }).eq('status', 'INQUIRY'),
      ])

      if (talentRes.error) throw talentRes.error
      if (contactsRes.error) throw contactsRes.error
      if (paymentsRes.error) throw paymentsRes.error
      if (activeProjectsRes.error) throw activeProjectsRes.error
      if (pendingBookingsRes.error) throw pendingBookingsRes.error

      const totalPaise = paymentsRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      const totalRevenue = Math.round(totalPaise / 100)

      return ok({
        // For new requirements
        total_talent: talentRes.count || 0,
        unread_contacts: contactsRes.count || 0,
        total_revenue: totalRevenue,

        // For existing frontend compatibility
        activeProjects: activeProjectsRes.count || 0,
        pendingBookings: pendingBookingsRes.count || 0,
        totalTalent: talentRes.count || 0,
        totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
      })
    }

    // 2. GET USERS LIST (PAGINATED)
    if (req.method === 'GET' && action === 'users') {
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const limit = parseInt(url.searchParams.get('limit') || '20', 10)
      const search = url.searchParams.get('search')
      const role = url.searchParams.get('role')

      const from = (page - 1) * limit
      const to = from + limit - 1

      let query = adminSupabase
        .from('User')
        .select('id, email, firstName, lastName, role, isActive, createdAt', { count: 'exact' })

      if (role) {
        query = query.eq('role', role)
      }

      if (search) {
        query = query.or(`email.ilike.%${search}%,firstName.ilike.%${search}%,lastName.ilike.%${search}%`)
      }

      const { data, count, error } = await query
        .order('createdAt', { ascending: false })
        .range(from, to)

      if (error) throw error

      const total = count || 0
      return ok({
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    }

    return err('Invalid action or method')
  } catch (error: any) {
    return err(error.message, 500)
  }
})
