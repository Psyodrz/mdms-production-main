import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the shared CMS ResourceManager UI
 * (/super-admin/cms/<resource>). Handles create/search/pagination/delete.
 */
export class CmsResourcePage extends BasePage {
  async open(resource: string) {
    await this.goto(`/super-admin/cms/${resource}`);
    await this.expectAuthenticated();
    // The manager renders either a table, an empty state, or a demo banner.
    await expect(this.page.getByRole('button', { name: /^New /i }).first()).toBeVisible({ timeout: 20_000 });
  }

  async search(term: string) {
    const input = this.page.getByPlaceholder(/search/i).first();
    await input.fill(term);
  }

  async openCreateDialog() {
    await this.page.getByRole('button', { name: /^New /i }).first().click();
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  /** Fill a labelled field inside the create/edit dialog. */
  async fillField(label: RegExp | string, value: string) {
    const dialog = this.page.getByRole('dialog');
    const field = dialog.getByLabel(label).first();
    await field.fill(value);
  }

  async submitDialog() {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('button', { name: /save|create|update/i }).first().click();
  }

  async nextPage() {
    await this.page.getByRole('button', { name: /^next$/i }).click();
  }

  async hasPagination(): Promise<boolean> {
    return (await this.page.getByText(/page \d+ of \d+/i).count()) > 0;
  }

  async rowCount(): Promise<number> {
    return this.page.locator('table tbody tr').count();
  }
}
