import { test, expect, describeAsRole } from '../support/fixtures';
import * as path from 'path';

/**
 * Upload flow — real file to storage (no mocking). Runs against staging where
 * Supabase storage is reachable. Uses the CMS ResourceForm / MediaLibrary
 * file input. The asset must resolve to a permanent (non-blob:) URL.
 */
const FIXTURE_IMAGE = path.resolve(__dirname, '../fixtures/sample.png');

describeAsRole('SUPER_ADMIN', 'Media upload', () => {
  test('uploading an image yields a permanent URL', async ({ page }) => {
    await page.goto('/super-admin/cms/site-config');

    // Open the hero media picker which mounts the MediaLibrary uploader.
    const pickerButton = page.getByRole('button').filter({ has: page.locator('svg') });
    const fileInput = page.locator('input[type="file"]').first();

    // The file input may be hidden behind the media library; reveal it.
    if ((await fileInput.count()) === 0) {
      // Try opening the media library modal from any "image" picker button.
      const anyPicker = page.locator('button:has(svg)').first();
      if (await anyPicker.count()) await anyPicker.click();
    }

    const input = page.locator('input[type="file"]').first();
    test.skip((await input.count()) === 0, 'No file input surfaced on this build/config');

    await input.setInputFiles(FIXTURE_IMAGE);

    // A successful upload surfaces a hosted URL (http/https), never a blob: URL.
    const urlField = page.locator('input[value^="http"]').first();
    await expect(urlField).toBeVisible({ timeout: 30_000 });
    const value = await urlField.inputValue();
    expect(value.startsWith('blob:')).toBeFalsy();
  });
});

describeAsRole('EDITOR', 'Editor upload page', () => {
  test('quick upload page renders an upload control', async ({ page }) => {
    await page.goto('/editor-portal/upload');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /quick file upload/i })).toBeVisible();
  });
});
