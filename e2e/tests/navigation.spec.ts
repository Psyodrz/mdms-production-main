import { test, expect, describeAsRole } from '../support/fixtures';

// Sidebar navigation for the role dashboards.
describeAsRole('SUPER_ADMIN', 'Navigation — Super Admin sidebar', () => {
  test('sidebar links navigate without errors', async ({ page }) => {
    await page.goto('/super-admin');
    const links = page.locator('aside a[href]');
    const count = Math.min(await links.count(), 8);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (!href || href.startsWith('http') || href === '/') continue;
      await page.goto(href);
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByText(/unhandled runtime error/i)).toHaveCount(0);
    }
  });
});

describeAsRole('EMPLOYEE', 'Navigation — Employee sidebar', () => {
  test('all employee sidebar tabs open', async ({ page }) => {
    await page.goto('/employee/dashboard');
    const links = page.locator('aside a[href^="/employee/dashboard"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (!href) continue;
      await page.goto(href);
      await expect(page).not.toHaveURL(/\/login/);
    }
  });
});

describeAsRole('PROJECT_MANAGER', 'Navigation — PM sidebar', () => {
  test('all PM sidebar tabs open', async ({ page }) => {
    await page.goto('/project-manager/dashboard');
    const links = page.locator('aside a[href^="/project-manager/dashboard"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (!href) continue;
      await page.goto(href);
      await expect(page).not.toHaveURL(/\/login/);
    }
  });
});
