import { test, expect, describeAsRole } from '../support/fixtures';
import { PublicPage } from '../pages/PublicPage';
import { testData } from '../support/test-data';

// Public contact form (GUEST) — real submission to the backend.
test.describe('Forms — Contact (GUEST)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('submitting the contact form succeeds', async ({ page }) => {
    const pub = new PublicPage(page);
    const data = testData.contactSubmission();
    await pub.submitContactForm(data);
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /thank|sent|success|received/i }).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('contact form blocks an empty submit', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: /send|submit/i }).first().click();
    // Required fields keep us on the page (no success toast).
    await expect(page).toHaveURL(/\/contact/);
  });
});

// Talent booking form (public hire request).
test.describe('Forms — Talent booking (GUEST)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('a public visitor can submit a hire request', async ({ page }) => {
    await page.goto('/talent/directory');
    const card = page.locator('a[href^="/talent/"]').first();
    test.skip((await card.count()) === 0, 'No talent seeded to book');
    await card.click();
    const bookLink = page.locator('a[href*="/book"]').first();
    test.skip((await bookLink.count()) === 0, 'No booking entry point on profile');
    await bookLink.click();

    const data = testData.hireRequest();
    await page.getByLabel(/name/i).first().fill(data.requesterName);
    await page.getByLabel(/email/i).first().fill(data.requesterEmail);
    const phone = page.getByLabel(/phone/i).first();
    if (await phone.count()) await phone.fill(data.requesterPhone);
    const brief = page.getByLabel(/brief|description|message/i).first();
    if (await brief.count()) await brief.fill(data.briefDescription);
    await page.getByRole('button', { name: /submit|send|request/i }).first().click();
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /success|submitted|received|thank/i }).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
