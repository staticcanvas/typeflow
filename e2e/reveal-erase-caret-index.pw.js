import { test, expect } from '@playwright/test';

test.describe('Reveal/erase/caret index', () => {
  test('lists every reveal style, erase style, and caret operation', async ({ page }) => {
    await page.goto('/guides/reveal-erase-caret-index/');
    await expect(page.locator('.index-demo[data-tf-demo]')).toHaveCount(23);
    await expect(page.locator('[data-tf-caret-demo]')).toHaveCount(5);
    // The TOC sidebar is hidden by responsive CSS at narrow widths; check it exists rather than that it's visible.
    await expect(page.locator('#TableOfContents a').first()).toBeAttached();
  });

  test('live reveal/erase demos animate rather than snap to their final text', async ({ page }) => {
    await page.goto('/guides/reveal-erase-caret-index/');
    const demo = page.locator('.index-demo[data-tf-demo]').first();
    const early = await demo.textContent();
    expect(early.length).toBeLessThan('Character by character.'.length);
    await expect(demo).toHaveText('Character by character.|', { timeout: 5_000 });
  });

  test('the jump() caret demo repositions the cursor mid-string, not just at the end', async ({ page }) => {
    await page.goto('/guides/reveal-erase-caret-index/');
    const jumpDemo = page.locator('[data-tf-caret-demo]').first();
    await expect(jumpDemo).toHaveText('git |commit -m wip', { timeout: 5_000 });
  });

  test('a "Try in Playground" link opens the playground pre-configured and running', async ({ page }) => {
    await page.goto('/guides/reveal-erase-caret-index/');
    const href = await page.getByRole('link', { name: 'Try in Playground →' }).first().getAttribute('href');
    expect(href).toContain('/playground/?');
    expect(href).toContain('typeStyle=char');

    await page.goto(href);
    await expect(page.locator('#pg-type-style')).toHaveValue('char');
    await expect(page.locator('#pg-text')).toHaveValue('Character by character.');
    await expect(page.locator('#pg-stage')).toContainText('Character by character', { timeout: 5_000 });
  });

  test('a spatial word-motion "Try in Playground" link reproduces its wordFadeDuration/wordStagger', async ({ page }) => {
    await page.goto('/guides/reveal-erase-caret-index/');
    const zoomLink = page.locator('a[href*="typeStyle=zoom-in-space"]').first();
    const href = await zoomLink.getAttribute('href');
    await page.goto(href);
    await expect(page.locator('#pg-type-style')).toHaveValue('zoom-in-space');
    await expect(page.locator('#pg-fade-duration')).toHaveValue('450');
    await expect(page.locator('#pg-stagger')).toHaveValue('225');
  });

  test('live demos retain their measured height while erased and after a responsive resize', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/guides/reveal-erase-caret-index/');
    const demo = page.locator('[data-tf-demo*="Words slide in from the right"]');
    await expect(demo).toBeVisible();
    await expect.poll(() => page.evaluate(() => typeof window.TypeFlow?.stopAll)).toBe('function');
    await expect.poll(() => demo.evaluate(el => Number.parseFloat(el.style.minBlockSize) || 0)).toBeGreaterThan(0);
    const initialHeight = (await demo.boundingBox())?.height;
    expect(initialHeight).toBeGreaterThan(0);

    await page.evaluate(() => window.TypeFlow.stopAll());
    await demo.evaluate((element) => element.replaceChildren());
    expect((await demo.boundingBox())?.height).toBe(initialHeight);

    await page.setViewportSize({ width: 320, height: 740 });
    await expect.poll(async () => Number.parseFloat(await demo.evaluate((element) => element.style.minBlockSize))).toBeGreaterThanOrEqual(initialHeight);
    const resizedReservation = await demo.evaluate((element) => Number.parseFloat(element.style.minBlockSize));
    expect((await demo.boundingBox())?.height).toBe(resizedReservation);
  });
});
