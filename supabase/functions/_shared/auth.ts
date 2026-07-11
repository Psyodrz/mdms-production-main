import { getSupabaseClient } from './client.ts'

export async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  const supabase = getSupabaseClient(authHeader)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Invalid token or user not logged in')
  }

  return user
}

export function hasRole(user: any, allowedRoles: string[]) {
  const userRole = user.user_metadata?.role || user.app_metadata?.role || 'GUEST'
  return allowedRoles.includes(userRole.toUpperCase())
}

export function requireRole(user: any, allowedRoles: string[]) {
  if (!hasRole(user, allowedRoles)) {
    throw new Error('Forbidden: Insufficient permissions')
  }
}
