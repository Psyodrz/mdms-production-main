import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** Public marketing + contact/booking forms (GUEST-accessible). */
export class PublicPage extends BasePage {
  async open(route: string) {
    await this.goto(route);
    await expect(this.page.locator('body')).toBeVisible();
  }

  async submitContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) {
    await this.goto('/contact');
    await this.page.getByLabel(/name/i).first().fill(data.name);
    await this.page.getByLabel(/email/i).first().fill(data.email);
    if (data.phone) {
      const phone = this.page.getByLabel(/phone/i).first();
      if (await phone.count()) await phone.fill(data.phone);
    }
    if (data.subject) {
      const subject = this.page.getByLabel(/subject/i).first();
      if (await subject.count()) await subject.fill(data.subject);
    }
    await this.page.getByLabel(/message/i).first().fill(data.message);
    await this.page.getByRole('button', { name: /send|submit/i }).first().click();
  }
}
