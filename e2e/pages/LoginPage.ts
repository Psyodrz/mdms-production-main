import { Page, expect } from '@playwright/test';

/**
 * Page object for the shared AuthForm login screen (/login).
 * Auth is Supabase email/password — no UI mocking.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
  }

  /** Log in and wait until we've navigated away from /login. */
  async loginAndExpectRedirect(email: string, password: string) {
    await this.login(email, password);
    await this.page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 });
  }

  async expectError() {
    // AuthForm renders errors in a brand-colored box above the form.
    await expect(this.page.locator('.text-brand', { hasText: /.+/ }).first()).toBeVisible();
  }
}
