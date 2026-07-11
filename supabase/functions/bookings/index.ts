import { getAdminClient } from '../_shared/client.ts'
import { ok, err, handleOptions } from '../_shared/response.ts'
import { getUserFromRequest } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  const optionRes = handleOptions(req)
  if (optionRes) return optionRes

  try {
    const user = await getUserFromRequest(req)
    const adminSupabase = getAdminClient()

    const userRole = user.user_metadata?.role || user.app_metadata?.role || 'GUEST'
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'list'

    // 1. GET BOOKINGS
    if (req.method === 'GET' && action === 'list') {
      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'PROJECT_MANAGER') {
        const { data, error } = await adminSupabase
          .from('Booking')
          .select('*, client:Client(*, user:User(firstName, lastName, email)), service:Service(*)')
          .order('createdAt', { ascending: false })
        if (error) throw error
        return ok(data)
      } else {
        const { data: client, error: clientErr } = await adminSupabase
          .from('Client')
          .select('id')
          .eq('userId', user.id)
          .single()

        if (clientErr || !client) {
          return err('Client profile not found', 403)
        }

        const { data, error } = await adminSupabase
          .from('Booking')
          .select('*, client:Client(*, user:User(firstName, lastName, email)), service:Service(*)')
          .eq('clientId', client.id)
          .order('createdAt', { ascending: false })
        if (error) throw error
        return ok(data)
      }
    }

    // 2. CREATE BOOKING
    if (req.method === 'POST' && action === 'create') {
      const { data: client, error: clientErr } = await adminSupabase
        .from('Client')
        .select('id, user:User(phone, firstName)')
        .eq('userId', user.id)
        .single()

      if (clientErr || !client) {
        return err('User is not a registered client', 403)
      }

      const body = await req.json()
      const { data, error } = await adminSupabase
        .from('Booking')
        .insert({
          clientId: client.id,
          serviceId: body.serviceId,
          status: 'INQUIRY',
          date: body.date,
          startTime: body.startTime || null,
          endTime: body.endTime || null,
          projectBrief: body.projectBrief || '',
          specialRequirements: body.specialRequirements || '',
        })
        .select()
        .single()

      if (error) throw error
      return ok(data)
    }

    return err('Invalid action or method')
  } catch (error: any) {
    return err(error.message, 500)
  }
})
