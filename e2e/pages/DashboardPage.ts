import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Generic role dashboard page object (employee / project-manager / portals). */
export class DashboardPage extends BasePage {
  async open(route: string) {
    await this.goto(route);
    await this.expectAuthenticated();
  }

  /** Switch a tab-based dashboard via the ?tab= query and confirm it renders. */
  async openTab(route: string, tab: string) {
    await this.goto(`${route}?tab=${tab}`);
    await this.expectAuthenticated();
    await expect(this.page.locator('body')).toBeVisible();
  }

  async expectHeading(text: RegExp | string) {
    await expect(this.page.getByRole('heading', { name: text }).first()).toBeVisible();
  }

  /** Assert the page has no visible runtime error boundary. */
  async expectNoRuntimeError() {
    await expect(this.page.getByText(/application error|unhandled runtime error|500|something went wrong/i))
      .toHaveCount(0);
  }
}
