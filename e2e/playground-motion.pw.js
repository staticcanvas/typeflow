import { test, expect } from '@playwright/test';

const SPATIAL_TYPE_STYLES = ['float-in-top', 'float-in-bottom', 'float-in-left', 'float-in-right', 'zoom-in-space'];

test.describe('Playground spatial word-motion reveal styles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground/');
    await expect.poll(() => page.evaluate(() => Boolean(window.TypeFlow))).toBe(true);
    await page.evaluate(() => window.TypeFlow.stopAll());
    await page.locator('#pg-text').fill('Stable spatial words');
  });

  for (const style of SPATIAL_TYPE_STYLES) {
    test(`${style} types the full phrase and leaves a clean final DOM`, async ({ page }) => {
      await page.locator('#pg-type-style').selectOption(style);
      await page.locator('#pg-btn-type').click();

      // Word wrappers should appear while the animation is in flight.
      await expect(page.locator('#pg-stage .tf-word-fade').first()).toBeVisible();

      await expect(page.locator('#pg-stage')).toContainText('Stable spatial words', { timeout: 10_000 });
      await expect(page.locator('#pg-stage .tf-word-fade')).toHaveCount(0);

      if (style === 'zoom-in-space') {
        const perspective = await page.locator('#pg-stage').evaluate((el) => el.style.perspective);
        expect(perspective).toBe('');
      }
    });
  }

  test('zoom-in-space applies a CSS perspective to the stage while animating', async ({ page }) => {
    await page.locator('#pg-type-style').selectOption('zoom-in-space');
    await page.locator('#pg-fade-duration').fill('1000');
    await page.locator('#pg-stagger').fill('800');
    await page.locator('#pg-btn-type').click();

    await expect
      .poll(async () => page.locator('#pg-stage').evaluate((el) => el.style.perspective))
      .not.toBe('');

    await expect(page.locator('#pg-stage')).toContainText('Stable spatial words', { timeout: 10_000 });
  });

  test('erasing with float-in-bottom clears the stage', async ({ page }) => {
    await page.locator('#pg-btn-type').click();
    await expect(page.locator('#pg-stage')).toContainText('Stable spatial words', { timeout: 10_000 });

    await page.locator('#pg-erase-style').selectOption('float-in-bottom');
    await page.locator('#pg-btn-erase').click();
    await expect(page.locator('#pg-stage')).toHaveText('', { timeout: 10_000 });
  });

  test('respects reduced motion by rendering the final text instantly', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#pg-reduced-motion').check();
    await page.locator('#pg-type-style').selectOption('float-in-top');
    await page.locator('#pg-btn-type').click();

    await expect(page.locator('#pg-stage')).toContainText('Stable spatial words', { timeout: 3_000 });
    await expect(page.locator('#pg-stage .tf-word-fade')).toHaveCount(0);
  });

  test('survives a responsive width change and interruption without transient wrappers', async ({ page }) => {
    await page.locator('#pg-type-style').selectOption('float-in-right');
    await page.locator('#pg-fade-duration').fill('1000');
    await page.locator('#pg-stagger').fill('800');
    await page.locator('#pg-btn-type').click();
    await expect(page.locator('#pg-stage .tf-word-fade').first()).toBeVisible();
    await expect(page.locator('#pg-stage .tf-word-fade[aria-hidden="true"]').first()).toBeAttached();
    await expect(page.locator('#pg-stage')).toHaveAttribute('aria-busy', 'true');

    await page.setViewportSize({ width: 360, height: 740 });
    await page.locator('#pg-btn-stop').click();
    await expect(page.locator('#pg-stage')).toHaveText('Stable spatial words');
    await expect(page.locator('#pg-stage .tf-word-fade')).toHaveCount(0);
    await expect(page.locator('#pg-stage')).not.toHaveAttribute('aria-busy');
    // Frame-time budgets belong to run-browser-benchmark.mjs. Sampling across
    // a viewport resize and parallel CI work measures runner contention here.
    expect(await page.evaluate(() => {
      const stage = document.getElementById('pg-stage');
      return {
        active: window.TypeFlow.isTyping(stage),
        cursor: window.TypeFlow.cursorIntervals.has(stage),
      };
    })).toEqual({ active: false, cursor: false });
    await expect(page.locator('#pg-stage')).toHaveScreenshot('motion-clean-final.png');
  });
});
