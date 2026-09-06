import { test, expect } from '@playwright/test';

test('page navigation follows the menu and links to its editable source', async ({ page }) => {
  await page.goto('/getting-started/');
  const end = page.locator('.page-end');
  await expect(end.getByRole('link', { name: 'Edit on GitLab' })).toHaveAttribute('href', 'https://gitlab.com/staticcanvas/typeflow/-/edit/main/docs/content/getting-started.md');
  await expect(end.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T/);
  await expect(end.locator('[rel="prev"]')).toHaveAttribute('href', '/');
  await end.locator('[rel="next"]').click();
  await expect(page).toHaveURL(/\/guides\/$/);
  await expect(page.locator('.page-end [rel="prev"]')).toHaveAttribute('href', '/getting-started/');
});

test('repository icons and centered mobile footer fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  for (const name of ['GitLab repository', 'GitHub repository']) {
    await expect(page.getByRole('link', { name, exact: true }).locator('svg')).toBeVisible();
  }
  const centers = await page.locator('.footer-grid > div').evaluateAll(els => els.map(el => {
    const rect = el.getBoundingClientRect();
    return rect.left + rect.width / 2;
  }));
  centers.forEach(center => expect(Math.abs(center - 180)).toBeLessThan(1));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
});
