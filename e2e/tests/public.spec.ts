import { test, expect } from '../support/fixtures';

// GUEST public site coverage — no auth.
test.describe('Public site (GUEST)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const pages = [
    '/', '/about', '/services', '/pricing', '/portfolio', '/projects', '/blog',
    '/team', '/testimonials', '/faq', '/contact', '/careers', '/reel', '/casting',
    '/privacy', '/terms', '/security', '/help', '/become-a-youtuber',
  ];

  for (const route of pages) {
    test(`loads ${route} without runtime error`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status() ?? 200).toBeLessThan(400);
      await expect(page.getByText(/unhandled runtime error|application error/i)).toHaveCount(0);
    });
  }

  test('portfolio detail navigation works', async ({ page }) => {
    await page.goto('/portfolio');
    const firstCard = page.locator('a[href^="/portfolio/"]').first();
    if (await firstCard.count()) {
      await firstCard.click();
      await expect(page).toHaveURL(/\/portfolio\//);
    }
  });

  test('primary navigation links resolve', async ({ page }) => {
    await page.goto('/');
    for (const [name, url] of [
      ['services', '/services'],
      ['portfolio', '/portfolio'],
      ['contact', '/contact'],
    ] as const) {
      const link = page.locator(`a[href="${url}"]`).first();
      if (await link.count()) {
        await link.click();
        await expect(page).toHaveURL(new RegExp(url));
        await page.goto('/');
      }
    }
  });
});
