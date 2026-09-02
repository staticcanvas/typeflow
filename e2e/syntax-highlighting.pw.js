import { test, expect } from '@playwright/test';

const CHROMA_LANGUAGES = [
  { heading: 'JavaScript', needle: 'Announcer' },
  { heading: 'TypeScript', needle: 'ReleaseNote' },
  { heading: 'HTML', needle: 'playground target markup' },
  { heading: 'CSS', needle: 'matrix-card' },
  { heading: 'JSON', needle: '@staticcanvas/typeflow' },
  { heading: 'Bash', needle: 'run-benchmark.mjs' },
  { heading: 'PowerShell', needle: 'FromTag' },
];

function relativeLuminance([r, g, b]) {
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function parseRgb(color) {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  return match[1].split(',').slice(0, 3).map((n) => parseFloat(n.trim()));
}

test.describe('Syntax highlighting fixtures', () => {
  for (const { heading, needle } of CHROMA_LANGUAGES) {
    test(`${heading} fixture renders a highlighted Chroma block`, async ({ page }) => {
      await page.goto('/guides/syntax-highlighting/');
      const section = page.locator(`h2:has-text("${heading}")`).locator('xpath=following-sibling::div[contains(@class,"highlight")][1]');
      const block = section.locator('pre.chroma, pre').first();
      await expect(block).toContainText(needle);

      const tokenCount = await section.locator('pre.chroma span[class]').count();
      expect(tokenCount).toBeGreaterThan(0);
    });
  }

  test('Mermaid fixture renders as a diagram, not a highlighted Chroma block', async ({ page }) => {
    await page.goto('/guides/syntax-highlighting/');
    const diagram = page.locator('.mermaid-diagram').first();
    await expect(diagram.locator('.mermaid-render svg')).toBeVisible({ timeout: 10_000 });
    await expect(diagram.locator('.mermaid-source code')).toContainText('changelog.json');
  });

  test('code text is legible against its background in both themes', async ({ page }) => {
    await page.goto('/guides/syntax-highlighting/');
    const block = page.locator('pre.chroma').first();
    await expect(block).toBeVisible();

    const contrastRatio = async () => page.evaluate((selector) => {
      const el = document.querySelector(selector);
      const style = getComputedStyle(el);
      return { color: style.color, background: style.backgroundColor };
    }, 'pre.chroma');

    const { color, background } = await contrastRatio();
    const fg = parseRgb(color);
    let bg = parseRgb(background);
    if (!bg || background === 'rgba(0, 0, 0, 0)') {
      bg = parseRgb(await page.evaluate(() => getComputedStyle(document.body).backgroundColor));
    }
    expect(fg).not.toBeNull();
    expect(bg).not.toBeNull();

    const l1 = relativeLuminance(fg) + 0.05;
    const l2 = relativeLuminance(bg) + 0.05;
    const ratio = l1 > l2 ? l1 / l2 : l2 / l1;
    expect(ratio).toBeGreaterThan(2.5);
  });
});
