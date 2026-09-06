import { test, expect } from '@playwright/test';

test.describe('Header search modal', () => {
  test('opens with Ctrl+K, focuses the input, and closes with Escape', async ({ page }) => {
    await page.goto('/');
    const modal = page.locator('#typeflow-search-modal');
    await expect(modal).toBeHidden();

    await page.keyboard.press('Control+k');
    await expect(modal).toBeVisible();
    await expect(page.locator('#search-modal-input')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('Ctrl+K toggles the modal closed on a second press', async ({ page }) => {
    await page.goto('/');
    const modal = page.locator('#typeflow-search-modal');

    await page.keyboard.press('Control+k');
    await expect(modal).toBeVisible();

    await page.keyboard.press('Control+k');
    await expect(modal).toBeHidden();
  });

  test('the trigger button opens the modal and exposes an accessible name', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('[data-search-trigger]');
    await expect(trigger).toHaveAttribute('aria-label', /Search documentation/);
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');

    await trigger.click();
    await expect(page.locator('#typeflow-search-modal')).toBeVisible();
    await expect(page.locator('#typeflow-search-modal')).toHaveAttribute('role', 'dialog');
    await expect(page.locator('#typeflow-search-modal')).toHaveAttribute('aria-modal', 'true');
  });

  test('closing via the dialog close button returns focus without leaving the modal visible', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-search-trigger]').click();
    await expect(page.locator('#typeflow-search-modal')).toBeVisible();

    await page.locator('.search-modal-esc').click();
    await expect(page.locator('#typeflow-search-modal')).toBeHidden();
    await expect(page.locator('[data-search-trigger]')).toBeFocused();
  });

  test('opens with the platform Meta+K shortcut', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Meta+k');
    await expect(page.locator('#typeflow-search-modal')).toBeVisible();
    await expect(page.locator('#search-modal-input')).toBeFocused();
  });
});

test.describe('Header search at narrow widths', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('keeps an accessible name on the trigger even when the icon is visually hidden', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('[data-search-trigger]');
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-label', /Search documentation/);

    const kbdHint = trigger.locator('.search-trigger-kbd');
    if (await kbdHint.count()) {
      const box = await kbdHint.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
    }

    await expect(trigger.locator('.search-trigger-icon')).toBeHidden();
    await trigger.focus();
    await expect(trigger).toBeFocused();
  });

  test('header actions meet the minimum touch target size', async ({ page }) => {
    await page.goto('/guides/extensions/');
    for (const control of await page.locator('.site-header button:visible').all()) {
      const box = await control.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('the search modal remains usable at 320px width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');
    await page.locator('[data-search-trigger]').click();
    const dialog = page.locator('.search-modal-dialog');
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(320);
  });

  test('reflows at a 200% browser-zoom-equivalent viewport without horizontal page overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');

    const trigger = page.locator('[data-search-trigger]');
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.locator('#search-modal-input')).toBeFocused();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
});
