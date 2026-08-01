import { test, expect, describeAsRole } from '../support/fixtures';
import { LoginPage } from '../pages/LoginPage';
import { BasePage } from '../pages/BasePage';
import { ROLE_CONFIGS, credsFor, RoleName } from '../support/roles';

const roles = Object.keys(ROLE_CONFIGS) as Exclude<RoleName, 'GUEST'>[];

test.describe('Authentication', () => {
  test.describe.configure({ mode: 'parallel' });

  // Fresh (unauthenticated) context for login/error tests.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('invalid credentials show an error and stay on /login', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('nobody-e2e@example.com', 'wrong-password-123');
    await login.expectError();
    await expect(page).toHaveURL(/\/login/);
  });

  test('login form validates required fields', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.getByRole('button', { name: /sign in/i }).click();
    // HTML5 required prevents navigation.
    await expect(page).toHaveURL(/\/login/);
  });

  for (const role of roles) {
    test(`${role} can log in and lands on their dashboard`, async ({ page }) => {
      const creds = credsFor(role);
      test.skip(!creds, `No seeded credentials for ${role}`);
      const login = new LoginPage(page);
      await login.goto();
      await login.loginAndExpectRedirect(creds!.email, creds!.password);
      await expect(page).not.toHaveURL(/\/login/);
    });
  }
});

// Logout is exercised as an authenticated role (SUPER_ADMIN if available).
describeAsRole('SUPER_ADMIN', 'Logout', () => {
  test('signing out returns to /login and protects routes again', async ({ page }) => {
    const base = new BasePage(page);
    await page.goto('/super-admin');
    await base.expectAuthenticated();
    await base.signOut();
    await expect(page).toHaveURL(/\/login/);
    // After logout, a protected route must bounce back to login.
    await page.goto('/super-admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
