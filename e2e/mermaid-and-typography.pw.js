import { test, expect } from '@playwright/test';

const MERMAID_PAGES = ['/guides/extensions/', '/guides/syntax-highlighting/'];

for (const path of MERMAID_PAGES) {
  test.describe(`Mermaid diagram rendering on ${path}`, () => {
    test('renders an SVG diagram at desktop width', async ({ page }) => {
      await page.goto(path);
      const diagram = page.locator('.mermaid-diagram').first();
      await expect(diagram).toBeVisible();
      await expect(diagram.locator('.mermaid-render svg')).toBeVisible({ timeout: 10_000 });
      await expect(diagram.locator('.mermaid-render')).toHaveAttribute('role', 'img');
    });

    test('renders without horizontal overflow at 360px width', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(path);
      const diagram = page.locator('.mermaid-diagram').first();
      await expect(diagram.locator('.mermaid-render svg')).toBeVisible({ timeout: 10_000 });

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test('falls back to a readable source block if JavaScript never processes it', async ({ page }) => {
      await page.goto(path);
      const source = page.locator('.mermaid-source code').first();
      await expect(source).toContainText(/-->|LR|TB/);
    });
  });
}

test.describe('Sidebar typography at narrow widths', () => {
  for (const width of [320, 360]) {
    test(`sidebar navigation has no horizontal clipping at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/guides/erase-styles/');

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      const activeLink = page.locator('.sidebar-link[aria-current="page"], .sidebar-link.is-active').first();
      if (await activeLink.count() && await activeLink.isVisible()) {
        const box = await activeLink.boundingBox();
        if (box) {
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
        }
      }
    });
  }
});
