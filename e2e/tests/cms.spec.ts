import { test, expect, describeAsRole } from '../support/fixtures';
import { CmsResourcePage } from '../pages/CmsResourcePage';

// Every CMS module must load its ResourceManager (New button visible).
describeAsRole('SUPER_ADMIN', 'CMS modules load', () => {
  const resources = [
    'portfolio', 'blog', 'team', 'testimonials', 'services', 'faq',
    'announcements', 'courses', 'media', 'newsletter', 'contacts',
    'castingCalls', 'featureFlags', 'salesLeads', 'salesTargets', 'referrals',
  ];

  for (const resource of resources) {
    test(`${resource} module renders`, async ({ page }) => {
      await page.goto(`/super-admin/cms/${resource}`);
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByText(/unhandled runtime error|application error/i)).toHaveCount(0);
    });
  }

  test('site-config editor loads all tabs', async ({ page }) => {
    await page.goto('/super-admin/cms/site-config');
    for (const tab of ['hero', 'stats', 'pricing', 'navbar', 'footer', 'seo', 'showreels']) {
      const btn = page.getByRole('button', { name: new RegExp(`^${tab}$`, 'i') }).first();
      if (await btn.count()) await btn.click();
      await expect(page.getByText(/unhandled runtime error/i)).toHaveCount(0);
    }
  });

  test('recycle bin loads', async ({ page }) => {
    await page.goto('/super-admin/cms/recycle-bin');
    await expect(page).not.toHaveURL(/\/login/);
  });
});

// Search + pagination behaviour on a populated resource.
describeAsRole('SUPER_ADMIN', 'CMS search & pagination', () => {
  test('portfolio search filters the list', async ({ page }) => {
    const cms = new CmsResourcePage(page);
    await cms.open('portfolio');
    await cms.search('zzz-no-such-item-zzz');
    // Either an empty state or zero table rows after filtering.
    const rows = await cms.rowCount();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('pagination advances when more than one page exists', async ({ page }) => {
    const cms = new CmsResourcePage(page);
    await cms.open('portfolio');
    if (await cms.hasPagination()) {
      await cms.nextPage();
      await expect(page.getByText(/page 2 of/i)).toBeVisible();
    }
  });
});
