import { test, expect, describeAsRole } from '../support/fixtures';
import { ROLE_CONFIGS, RoleName } from '../support/roles';

const roles = Object.keys(ROLE_CONFIGS) as Exclude<RoleName, 'GUEST'>[];

// GUEST: unauthenticated access to protected routes must redirect to login.
test.describe('Route protection — GUEST', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const protectedRoutes = [
    '/admin',
    '/super-admin',
    '/client-portal',
    '/talent-dashboard',
    '/editor-portal',
    '/employee/dashboard',
    '/project-manager/dashboard',
  ];

  for (const route of protectedRoutes) {
    test(`guest visiting ${route} is redirected to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });
    });
  }

  test('guest can view public pages', async ({ page }) => {
    for (const route of ['/', '/portfolio', '/services', '/pricing', '/contact', '/blog']) {
      await page.goto(route);
      await expect(page).not.toHaveURL(/\/login/);
    }
  });
});

// Authenticated role matrix: allowed route loads; denied routes are blocked.
for (const role of roles) {
  describeAsRole(role, `Route protection — ${role}`, () => {
    const cfg = ROLE_CONFIGS[role];

    test(`can access ${cfg.allowedRoute}`, async ({ page }) => {
      await page.goto(cfg.allowedRoute);
      await expect(page).not.toHaveURL(/\/login/);
    });

    for (const denied of cfg.deniedRoutes) {
      test(`cannot access ${denied}`, async ({ page }) => {
        await page.goto(denied);
        // Middleware redirects unauthorized roles away from the denied route
        // (either to /login or to their own dashboard) — assert we did NOT stay.
        await expect(page).not.toHaveURL(new RegExp(`${denied}(/|$)`));
      });
    }
  });
}
