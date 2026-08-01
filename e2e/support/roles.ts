import * as path from 'path';

export type RoleName =
  | 'GUEST'
  | 'CLIENT'
  | 'TALENT'
  | 'EDITOR'
  | 'EMPLOYEE'
  | 'PROJECT_MANAGER'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export interface RoleConfig {
  role: RoleName;
  /** Env var prefix, e.g. E2E_SUPER_ADMIN_EMAIL / E2E_SUPER_ADMIN_PASSWORD */
  envPrefix: string;
  /** Where this role lands after login (post-login redirect target). */
  landing: string;
  /** A route this role IS allowed to open. */
  allowedRoute: string;
  /** Routes this role must NOT access (should redirect to /login or their dashboard). */
  deniedRoutes: string[];
}

export const AUTH_DIR = path.resolve(__dirname, '../.auth');

/**
 * Route matrix derived from apps/web/src/middleware.ts ROLE_ROUTES and the
 * dashboard routes. GUEST is unauthenticated.
 *
 * Note: /studio-8f2k and /studio-8f2k/mgmt rewrite to /super-admin and /admin
 * (next.config.ts). We test the canonical destinations.
 */
export const ROLE_CONFIGS: Record<Exclude<RoleName, 'GUEST'>, RoleConfig> = {
  CLIENT: {
    role: 'CLIENT',
    envPrefix: 'E2E_CLIENT',
    landing: '/client-portal',
    allowedRoute: '/client-portal',
    deniedRoutes: ['/admin', '/super-admin', '/talent-dashboard', '/editor-portal'],
  },
  TALENT: {
    role: 'TALENT',
    envPrefix: 'E2E_TALENT',
    landing: '/talent-dashboard',
    allowedRoute: '/talent-dashboard',
    deniedRoutes: ['/admin', '/super-admin', '/client-portal', '/editor-portal'],
  },
  EDITOR: {
    role: 'EDITOR',
    envPrefix: 'E2E_EDITOR',
    landing: '/editor-portal',
    allowedRoute: '/editor-portal',
    deniedRoutes: ['/admin', '/super-admin', '/talent-dashboard', '/client-portal'],
  },
  EMPLOYEE: {
    role: 'EMPLOYEE',
    envPrefix: 'E2E_EMPLOYEE',
    landing: '/employee/dashboard',
    allowedRoute: '/employee/dashboard',
    deniedRoutes: ['/admin', '/super-admin', '/talent-dashboard', '/editor-portal'],
  },
  PROJECT_MANAGER: {
    role: 'PROJECT_MANAGER',
    envPrefix: 'E2E_PROJECT_MANAGER',
    landing: '/project-manager/dashboard',
    allowedRoute: '/project-manager/dashboard',
    deniedRoutes: ['/super-admin', '/talent-dashboard', '/editor-portal'],
  },
  ADMIN: {
    role: 'ADMIN',
    envPrefix: 'E2E_ADMIN',
    landing: '/admin',
    allowedRoute: '/admin',
    deniedRoutes: ['/super-admin'],
  },
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    envPrefix: 'E2E_SUPER_ADMIN',
    landing: '/super-admin',
    allowedRoute: '/super-admin',
    deniedRoutes: [],
  },
};

export function storageStatePath(role: RoleName): string {
  return path.join(AUTH_DIR, `${role.toLowerCase()}.json`);
}

export function credsFor(role: Exclude<RoleName, 'GUEST'>): { email: string; password: string } | null {
  const cfg = ROLE_CONFIGS[role];
  const email = process.env[`${cfg.envPrefix}_EMAIL`];
  const password = process.env[`${cfg.envPrefix}_PASSWORD`];
  if (!email || !password) return null;
  return { email, password };
}
