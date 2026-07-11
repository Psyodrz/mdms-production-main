import { Role } from '@mdms/types';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ROLE_ROUTES: Record<string, Role[]> = {
  // Secret admin base paths (served via next.config rewrites). The more
  // specific /mgmt (Admin) entry MUST come before the generic Super Admin one
  // because matching uses the first prefix that matches.
  '/studio-8f2k/mgmt':[Role.ADMIN, Role.SUPER_ADMIN],
  '/studio-8f2k':     [Role.SUPER_ADMIN],
  '/super-admin':     [Role.SUPER_ADMIN],
  '/admin':           [Role.ADMIN, Role.SUPER_ADMIN],
  '/client-portal':   [Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN],
  '/talent-dashboard':[Role.TALENT, Role.ADMIN, Role.SUPER_ADMIN],
  '/editor-portal':   [Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN],
  '/employee-portal': [Role.EMPLOYEE, Role.ADMIN, Role.SUPER_ADMIN],
  '/project-manager': [Role.PROJECT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Block direct access to the real admin paths — they are only reachable via
  // the secret /studio-8f2k base path (served through next.config rewrites).
  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
    return NextResponse.rewrite(new URL('/404', req.url));
  }

  // Redirect /model/dashboard to /talent-dashboard
  if (pathname.startsWith('/model/dashboard')) {
    return NextResponse.redirect(new URL('/talent-dashboard', req.url));
  }

  let userRole: Role | null = null;

  // 1. Try NextAuth token first
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      userRole = (token.role as string)?.toUpperCase() as Role;
    }
  } catch (e) {
    // NextAuth check ignored
  }

  // 2. Try Supabase session fallback if NextAuth is null
  if (!userRole) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return req.cookies.getAll();
            },
            setAll(cookiesToSet) {
              // Read-only during request matching
            },
          },
        });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userRole = (user.user_metadata?.role as string)?.toUpperCase() as Role;
        }
      }
    } catch (e) {
      // Supabase fallback check ignored
    }
  }

  // Not authenticated — redirect to login for any protected route
  const isProtected = Object.keys(ROLE_ROUTES).some(p => pathname.startsWith(p));
  if (isProtected && !userRole) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Authenticated — check role
  if (isProtected && userRole) {
    const matchedPrefix = Object.keys(ROLE_ROUTES).find(p => pathname.startsWith(p));
    if (matchedPrefix) {
      const allowed = ROLE_ROUTES[matchedPrefix];
      if (!allowed.includes(userRole)) {
        return NextResponse.redirect(new URL(getDashboardUrl(userRole), req.url));
      }
    }
  }

  return NextResponse.next();
}

function getDashboardUrl(role: Role): string {
  switch (role) {
    case Role.SUPER_ADMIN:    return '/studio-8f2k';
    case Role.ADMIN:          return '/studio-8f2k/mgmt';
    case Role.CLIENT:         return '/client-portal';
    case Role.TALENT:         return '/talent-dashboard';
    case Role.EDITOR:         return '/editor-portal';
    case Role.EMPLOYEE:       return '/employee-portal';
    case Role.PROJECT_MANAGER:return '/project-manager';
    default:                  return '/';
  }
}

export const config = {
  matcher: [
    '/studio-8f2k',
    '/studio-8f2k/:path*',
    '/super-admin/:path*',
    '/admin/:path*',
    '/client-portal/:path*',
    '/talent-dashboard/:path*',
    '/editor-portal/:path*',
    '/employee-portal/:path*',
    '/project-manager/:path*',
    '/model/dashboard/:path*',
  ],
};
