import { Page, expect } from '@playwright/test';

/** Common helpers shared by all page objects. */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  /** Assert the current route was NOT bounced to the login screen. */
  async expectAuthenticated() {
    await expect(this.page).not.toHaveURL(/\/login/);
  }

  /** Wait for a sonner toast containing the given text. */
  async expectToast(text: RegExp | string) {
    await expect(this.page.locator('[data-sonner-toast], [role="status"]').filter({ hasText: text }).first())
      .toBeVisible({ timeout: 15_000 });
  }

  /** Sign out via the DashboardLayout / navbar sign-out control. */
  async signOut() {
    const signOut = this.page.getByRole('button', { name: /sign out/i }).first();
    await signOut.click();
    await this.page.waitForURL(/\/login/, { timeout: 30_000 });
  }
}
