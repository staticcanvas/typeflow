import { test, expect } from '@playwright/test';

const CHROMA_CLASSES = ['c1', 'k', 'kd', 'kt', 'nf', 'na', 'nv', 'no', 's2', 'se', 'mi', 'o', 'p', 'err', 'gi', 'gd'];

const colorChannels = (value) => (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
const luminance = (value) => {
  const channels = colorChannels(value).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};
const contrast = (foreground, background) => {
  const left = luminance(foreground);
  const right = luminance(background);
  return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
};

test.describe('Syntax highlighting presentation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api/');
    await expect(page.locator('.doc-content .highlight pre').first()).toHaveCSS('overflow-x', 'auto');
  });

  test('keeps long lines contained and keyboard-scrollable with a working copy control', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const pre = page.locator('.doc-content .highlight pre').first();
    await pre.evaluate((element) => {
      element.querySelector('code').textContent = `const fixture = '${'long-token-'.repeat(80)}';`;
    });

    await pre.focus();
    await expect(pre).toBeFocused();
    for (let index = 0; index < 12; index += 1) await page.keyboard.press('ArrowRight');
    await expect.poll(() => pre.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth + 1)
    );

    await expect(pre.locator('.copy-button')).toHaveCount(1);
    await pre.locator('.copy-button').click();
    await expect(pre.locator('.copy-button')).toHaveText('Copied!');
  });

  test('keeps token and selection contrast readable in both themes', async ({ page }) => {
    const pre = page.locator('.doc-content .highlight pre').first();
    await pre.evaluate((element, classes) => {
      const code = element.querySelector('code');
      code.replaceChildren(...classes.map((name) => {
        const token = document.createElement('span');
        token.className = name;
        token.textContent = `${name} `;
        return token;
      }));
    }, CHROMA_CLASSES);

    for (const theme of ['dark', 'light']) {
      await page.locator('html').evaluate((element, value) => { element.dataset.theme = value; }, theme);
      const result = await pre.evaluate((element, classes) => {
        const background = getComputedStyle(element).backgroundColor;
        const ratios = classes.map((name) => {
          const foreground = getComputedStyle(element.querySelector(`.${name}`)).color;
          return { name, foreground, background };
        });
        const selection = getComputedStyle(element.querySelector('code'), '::selection');
        return { ratios, selectionColor: selection.color, selectionBackground: selection.backgroundColor };
      }, CHROMA_CLASSES);

      for (const token of result.ratios) {
        expect.soft(contrast(token.foreground, token.background), `${theme} .${token.name}`).toBeGreaterThanOrEqual(3);
      }
      expect(contrast(result.selectionColor, result.selectionBackground)).toBeGreaterThanOrEqual(3);
    }
  });

  test('removes copy-button motion when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const button = page.locator('.doc-content .copy-button').first();
    await expect(button).toHaveCSS('transition-duration', '0s');
    await expect(button).toHaveCSS('transform', 'none');
  });
});
