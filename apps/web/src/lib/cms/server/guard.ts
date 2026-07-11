import { auth } from '@/auth';

/**
 * Verify the caller has an admin-level NextAuth session. Returns the role on
 * success, or null when unauthorized. BFF routes call this before proxying to
 * the API so the browser can never reach admin endpoints anonymously.
 */
export async function requireAdmin(): Promise<{ role: string } | null> {
  const session = await auth();
  const role = session?.user?.role;
  const upperRole = role?.toUpperCase();
  if (upperRole === 'SUPER_ADMIN' || upperRole === 'ADMIN') {
    return { role: role as string };
  }
  return null;
}
