import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BasePage } from '../pages/BasePage';
import { DashboardPage } from '../pages/DashboardPage';
import { CmsResourcePage } from '../pages/CmsResourcePage';
import { PublicPage } from '../pages/PublicPage';
import { RoleName, credsFor, storageStatePath, ROLE_CONFIGS } from './roles';

/**
 * Reusable fixtures: page objects + a `roleGuard` helper that skips a spec when
 * the required role's seeded credentials are not present, keeping the suite
 * green on partial-credential environments.
 */
type Fixtures = {
  loginPage: LoginPage;
  basePage: BasePage;
  dashboardPage: DashboardPage;
  cmsPage: CmsResourcePage;
  publicPage: PublicPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  basePage: async ({ page }, use) => { await use(new BasePage(page)); },
  dashboardPage: async ({ page }, use) => { await use(new DashboardPage(page)); },
  cmsPage: async ({ page }, use) => { await use(new CmsResourcePage(page)); },
  publicPage: async ({ page }, use) => { await use(new PublicPage(page)); },
});

export { expect };

/** Guard a describe/test block behind a role's seeded credentials. */
export function requireRole(role: Exclude<RoleName, 'GUEST'>) {
  const creds = credsFor(role);
  test.skip(!creds, `No seeded credentials for ${role}`);
}

/** Convenience: bind a spec file to a role's saved auth storage state. */
export function useRole(role: Exclude<RoleName, 'GUEST'>) {
  test.use({ storageState: storageStatePath(role) });
}

/**
 * Declare a describe block that runs authenticated as `role`. If the role has
 * no seeded credentials the whole block is skipped (no browser context is
 * created, so a missing storage-state file never causes an error).
 */
export function describeAsRole(
  role: Exclude<RoleName, 'GUEST'>,
  title: string,
  fn: () => void,
) {
  const runner = credsFor(role) ? test.describe : test.describe.skip;
  runner(title, () => {
    test.use({ storageState: storageStatePath(role) });
    fn();
  });
}

export { ROLE_CONFIGS, credsFor };
