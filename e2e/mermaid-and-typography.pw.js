import { test, expect } from '@playwright/test';

const MERMAID_PAGES = ['/guides/extensions/'];

const DIAGRAM_FIXTURES = [
  'flowchart LR\n  A[Start] --> B[Finish]',
  'sequenceDiagram\n  participant A\n  participant B\n  A->>B: Message',
  'stateDiagram-v2\n  [*] --> Idle\n  Idle --> Active',
  'classDiagram\n  class TypeFlow {\n    +type()\n  }',
];

async function injectDiagramFixtures(page, path) {
  await page.route(`**${path}`, async (route) => {
    const response = await route.fetch();
    let body = await response.text();
    const fixtures = DIAGRAM_FIXTURES
      .map((definition) => `<pre><code class="language-mermaid">${definition}</code></pre>`)
      .join('');
    body = body.replace('</main>', `${fixtures}</main>`);
    await route.fulfill({ response, body });
  });
}

for (const path of MERMAID_PAGES) {
  test.describe(`Mermaid diagram rendering on ${path}`, () => {
    test('renders an SVG diagram at desktop width', async ({ page }) => {
      await injectDiagramFixtures(page, path);
      await page.goto(path);
      const diagrams = page.locator('.mermaid-diagram');
      await expect(diagrams).toHaveCount(5);
      await expect(diagrams.locator('.mermaid-render svg')).toHaveCount(5, { timeout: 10_000 });
      await expect(diagrams.first().locator('.mermaid-render')).toHaveAttribute('role', 'img');
      await expect(diagrams.locator('.mermaid-error')).toHaveCount(0);
    });

    test('renders without horizontal overflow at 360px width', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await injectDiagramFixtures(page, path);
      await page.goto(path);
      await expect(page.locator('.mermaid-render svg')).toHaveCount(5, { timeout: 10_000 });

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test('rerenders once per diagram after a theme change with contrast-safe tokens', async ({ page }) => {
      await injectDiagramFixtures(page, path);
      await page.goto(path);
      const diagrams = page.locator('.mermaid-diagram');
      await expect(diagrams.locator('.mermaid-render svg')).toHaveCount(5, { timeout: 10_000 });

      const readThemeContrast = () => page.evaluate(() => {
        const parseHex = (value) => {
          const normalized = value.trim().replace('#', '');
          return [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16));
        };
        const luminance = (rgb) => {
          const channels = rgb.map((channel) => {
            const value = channel / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        };
        const styles = getComputedStyle(document.documentElement);
        const foreground = luminance(parseHex(styles.getPropertyValue('--tf-text-primary')));
        const background = luminance(parseHex(styles.getPropertyValue('--tf-bg-surface')));
        return {
          theme: document.documentElement.dataset.theme,
          ratio: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
        };
      });
      const initial = await readThemeContrast();
      expect(initial.ratio).toBeGreaterThanOrEqual(4.5);

      await page.locator('[data-theme-toggle]').click();
      const nextTheme = initial.theme === 'light' ? 'dark' : 'light';
      await expect(page.locator('html')).toHaveAttribute('data-theme', nextTheme);
      await expect.poll(async () => diagrams.locator('.mermaid-render svg').count()).toBe(5);
      for (const render of await page.locator('.mermaid-render').all()) {
        await expect(render.locator(':scope > svg')).toHaveCount(1);
      }
      expect((await readThemeContrast()).ratio).toBeGreaterThanOrEqual(4.5);
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

      await page.locator('[data-menu-toggle]').click();
      await expect(page.locator('#site-sidebar')).toBeVisible();

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      const activeLink = page.locator('.sidebar-link[aria-current="page"]').first();
      await expect(activeLink).toBeVisible();
      const box = await activeLink.boundingBox();
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width + 1);
    });
  }

  test('heading anchors scroll below the sticky header without changing content width', async ({ page }) => {
    await page.goto('/guides/erase-styles/');
    const article = page.locator('.doc-article');
    const widthBefore = (await article.boundingBox())?.width;
    const anchor = page.locator('.heading-anchor').first();
    await anchor.click();

    const positions = await page.evaluate(() => ({
      headerBottom: document.querySelector('.site-header').getBoundingClientRect().bottom,
      headingTop: document.querySelector('.doc-content h2').getBoundingClientRect().top,
    }));
    expect(positions.headingTop).toBeGreaterThanOrEqual(positions.headerBottom);
    expect((await article.boundingBox())?.width).toBe(widthBefore);
  });
});
