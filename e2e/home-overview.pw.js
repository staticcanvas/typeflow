import { test, expect } from '@playwright/test';

test.describe('Home animation overview', () => {
  test('presents the CDN entry, linked version tag, and animation feature groups', async ({ page }) => {
    await page.goto('/');

    const version = await page.locator('body').getAttribute('data-package-version');
    const cdnUrl = `https://cdn.jsdelivr.net/npm/@staticcanvas/typeflow@${version}/dist/typeflow.esm.js`;

    const versionLink = page.locator('.hero-title-brand .hero-version');
    await expect(versionLink).toHaveText(`v${version}`);
    await expect(versionLink).toHaveAttribute('href', /downloads\/$/);
    expect(await versionLink.evaluate((element) => getComputedStyle(element).fontFamily)).toContain('JetBrains Mono');

    await expect(page.locator('.hero-cdn-source a')).toHaveAttribute('href', cdnUrl);
    await expect(page.getByRole('button', { name: 'Copy jsDelivr ESM URL' })).toHaveAttribute('data-copy', cdnUrl);

    const overview = page.locator('.animation-overview');
    await expect(overview).toBeVisible();
    await expect(overview.locator('.overview-card')).toHaveCount(4);
    await expect(overview.getByRole('heading', { level: 3 })).toHaveText([
      'Reveal styles',
      'Erase styles',
      'Timing and cursors',
      'Morphing, streaming, and sequences',
    ]);
    await expect(page.locator('.home-page .eyebrow')).toHaveCount(0);
  });

  test('keeps the overview and CDN row contained at narrow widths', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto('/');
    await expect(page.locator('.overview-grid')).toHaveCSS('grid-template-columns', /\d+(\.\d+)?px/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });
});
