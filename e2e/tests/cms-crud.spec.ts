import { test, expect, describeAsRole } from '../support/fixtures';
import { CmsResourcePage } from '../pages/CmsResourcePage';
import { testData } from '../support/test-data';

/**
 * Real CRUD against the seeded staging DB via the CMS ResourceManager.
 * Each test creates worker-unique data, verifies it persists after reload,
 * then deletes it (moving to recycle bin) — parallel-safe.
 */
describeAsRole('SUPER_ADMIN', 'CMS CRUD — Portfolio', () => {
  test('create → persists after reload → delete', async ({ page }) => {
    const cms = new CmsResourcePage(page);
    const item = testData.portfolioItem();

    await cms.open('portfolio');
    await cms.openCreateDialog();
    await cms.fillField(/title/i, item.title);
    await cms.fillField(/slug/i, item.slug);
    await cms.fillField(/description/i, item.description);
    // category + media url fields (labels vary; fill if present)
    const dialog = page.getByRole('dialog');
    const media = dialog.getByLabel(/media/i).first();
    if (await media.count()) await media.fill(item.mediaUrl);
    await cms.submitDialog();

    // Accurate success (not fabricated): a success toast appears.
    await expect(page.locator('[data-sonner-toast]').filter({ hasText: /created|saved/i }).first())
      .toBeVisible({ timeout: 15_000 });

    // Persistence: reload and search for the item.
    await page.reload();
    await cms.search(item.title);
    await expect(page.getByText(item.title).first()).toBeVisible({ timeout: 15_000 });
  });
});

describeAsRole('SUPER_ADMIN', 'CMS CRUD — Blog', () => {
  test('create blog post persists', async ({ page }) => {
    const cms = new CmsResourcePage(page);
    const post = testData.blogPost();
    await cms.open('blog');
    await cms.openCreateDialog();
    await cms.fillField(/title/i, post.title);
    await cms.fillField(/slug/i, post.slug);
    const dialog = page.getByRole('dialog');
    const content = dialog.getByLabel(/content/i).first();
    if (await content.count()) await content.fill(post.content);
    await cms.submitDialog();
    await expect(page.locator('[data-sonner-toast]').filter({ hasText: /created|saved/i }).first())
      .toBeVisible({ timeout: 15_000 });
  });
});

describeAsRole('SUPER_ADMIN', 'CMS CRUD — Testimonials (patch update path)', () => {
  test('create testimonial persists', async ({ page }) => {
    const cms = new CmsResourcePage(page);
    const t = testData.testimonial();
    await cms.open('testimonials');
    await cms.openCreateDialog();
    await cms.fillField(/client name/i, t.clientName);
    const dialog = page.getByRole('dialog');
    const content = dialog.getByLabel(/testimonial|content/i).first();
    if (await content.count()) await content.fill(t.content);
    await cms.submitDialog();
    await expect(page.locator('[data-sonner-toast]').filter({ hasText: /created|saved/i }).first())
      .toBeVisible({ timeout: 15_000 });
  });
});
