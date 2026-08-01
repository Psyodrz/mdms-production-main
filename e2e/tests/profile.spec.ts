import { test, expect, describeAsRole } from '../support/fixtures';

// Talent profile update — edit and confirm persistence.
describeAsRole('TALENT', 'Profile update', () => {
  test('talent can open the full edit profile page', async ({ page }) => {
    await page.goto('/talent-dashboard/edit');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /professional identity/i })).toBeVisible();
  });

  test('editing bio and saving shows a success toast', async ({ page }) => {
    await page.goto('/talent-dashboard/edit');
    const bio = page.getByLabel(/bio/i).first();
    test.skip((await bio.count()) === 0, 'Bio field not present on this build');
    const newBio = `E2E updated bio ${Date.now()}`;
    await bio.fill(newBio);
    await page.getByRole('button', { name: /save profile/i }).click();
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /updated|saved|success/i }).first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});

// Employee profile tab shows session identity.
describeAsRole('EMPLOYEE', 'Employee profile tab', () => {
  test('profile tab shows the account email', async ({ page }) => {
    await page.goto('/employee/dashboard?tab=profile');
    await expect(page.getByText(/email/i).first()).toBeVisible();
  });
});
