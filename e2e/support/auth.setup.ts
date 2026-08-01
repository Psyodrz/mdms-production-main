import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import { LoginPage } from '../pages/LoginPage';
import { AUTH_DIR, ROLE_CONFIGS, RoleName, credsFor, storageStatePath } from './roles';

setup.beforeAll(() => {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
});

const roles = Object.keys(ROLE_CONFIGS) as Exclude<RoleName, 'GUEST'>[];

for (const role of roles) {
  setup(`authenticate ${role}`, async ({ page }) => {
    const creds = credsFor(role);
    // Skip roles whose seeded credentials are not configured in .env.e2e.
    setup.skip(!creds, `No credentials configured for ${role} (set ${ROLE_CONFIGS[role].envPrefix}_EMAIL/_PASSWORD)`);

    const login = new LoginPage(page);
    await login.goto();
    await login.loginAndExpectRedirect(creds!.email, creds!.password);

    // Sanity-check we can reach the role's landing route while authenticated.
    await page.goto(ROLE_CONFIGS[role].allowedRoute);
    await expect(page).not.toHaveURL(/\/login/);

    await page.context().storageState({ path: storageStatePath(role) });
  });
}
