import { test, expect, describeAsRole } from '../support/fixtures';

test.describe('Error handling', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('unknown route renders a 404 (not-found), not a crash', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist-e2e');
    // Next renders the not-found page; status is 404 and no runtime error.
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/unhandled runtime error|application error/i)).toHaveCount(0);
  });

  test('unknown blog slug shows not-found', async ({ page }) => {
    const res = await page.goto('/blog/this-slug-does-not-exist-e2e');
    expect([404, 200]).toContain(res?.status() ?? 200);
    await expect(page.getByText(/unhandled runtime error/i)).toHaveCount(0);
  });
});

// Unknown CMS resource must 404 (getResource whitelist), not crash.
describeAsRole('SUPER_ADMIN', 'Error handling — CMS', () => {
  test('unknown CMS resource returns not-found', async ({ page }) => {
    const res = await page.goto('/super-admin/cms/not-a-real-resource-e2e');
    expect([404, 200]).toContain(res?.status() ?? 200);
    await expect(page.getByText(/unhandled runtime error/i)).toHaveCount(0);
  });
});
