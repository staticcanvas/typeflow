import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const usage = JSON.parse(readFileSync(new URL('../docs/data/terminalUsage.json', import.meta.url), 'utf8'));

test('Bash and app.js rotate independently through their datasets', async ({ page }) => {
  test.setTimeout(65_000);
  await page.goto('/');
  const install = page.locator('.terminal-install');
  const editor = page.locator('.terminal-editor');
  await expect(install.locator('.terminal-title')).toHaveText('bash');
  await expect(editor.locator('.terminal-title')).toHaveText('app.js');
  const initialHeight = await editor.evaluate(el => el.offsetHeight);
  await Promise.all([
    (async () => {
      for (const name of ['npm', 'bun', 'yarn', 'pnpm', 'jsr', 'npm']) {
        await expect(install).toHaveAttribute('data-example', name, { timeout: 12_000 });
        await expect(install.locator('[aria-hidden="false"] [data-live-code]')).toContainText('@staticcanvas/typeflow');
      }
    })(),
    (async () => {
      for (const name of ['esm', 'browser', 'node', 'bun', 'esm']) {
        await expect(editor).toHaveAttribute('data-example', name, { timeout: 12_000 });
        await expect(editor.locator('[aria-hidden="false"] .chroma')).toBeVisible();
        expect(await editor.evaluate(el => el.offsetHeight)).toBe(initialHeight);
      }
    })(),
  ]);
});

test('reduced motion is static with highlighted code and manual playback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.terminal-install [aria-hidden="false"] [data-live-code]')).toHaveText('npm install @staticcanvas/typeflow');
  await expect(page.locator('.terminal-editor [aria-hidden="false"] [data-live-code] .kr').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play usage rotation' })).toBeVisible();
  expect(await page.locator('.terminal-editor').evaluate(el => el.getAnimations().length)).toBe(0);
  await page.getByRole('button', { name: 'Play usage rotation' }).click();
  await expect(page.locator('.terminal-editor')).toHaveAttribute('data-example', 'browser', { timeout: 9_000 });
  await page.getByRole('button', { name: 'Pause usage rotation' }).click();
  await expect(page.getByRole('button', { name: 'Play usage rotation' })).toHaveAttribute('aria-pressed', 'true');
});

test('browser usage snippets execute against the actual library', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const example of usage.filter(entry => entry.id !== 'node')) {
    const result = await page.evaluate(async (code) => {
      const source = code.replace(/"(?:@staticcanvas\/typeflow|https:\/\/cdn.jsdelivr.net\/npm\/[^" ]+)"/, JSON.stringify(`${location.origin}/webutil/libs/typeflow.esm.js`));
      const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
      await import(url);
      URL.revokeObjectURL(url);
      const target = document.body.lastElementChild.cloneNode(true);
      target.querySelectorAll('.tf-cursor').forEach(cursor => cursor.remove());
      return target.textContent;
    }, example.code);
    expect(result).toBe('Hello, world.');
  }
});

test('both windows type progressively and retain JavaScript highlighting', async ({ page }) => {
  await page.goto('/');
  for (const selector of ['.terminal-install', '.terminal-editor']) {
    const code = page.locator(`${selector} [aria-hidden="false"] [data-live-code]`);
    await expect.poll(() => code.evaluate(el => window.TypeFlow.isTyping(el))).toBe(true);
    const before = await code.textContent();
    await expect.poll(() => code.textContent()).not.toBe(before);
  }
  await expect(page.locator('.terminal-editor [aria-hidden="false"] [data-live-code] .kr').first()).toBeVisible();
  await page.getByRole('button', { name: 'Pause usage rotation' }).click();
  await expect.poll(() => page.locator('.terminal-editor [aria-hidden="false"] [data-live-code]').evaluate(el => window.TypeFlow.isTyping(el))).toBe(false);
});

test('flipping windows never widen the page', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    let overflow = 0;
    let sawFlip = false;
    const start = performance.now();
    while (performance.now() - start < 12_000) {
      sawFlip ||= [...document.querySelectorAll('[data-hero-rolodex]')].some(el => el.getAnimations().length > 0);
      overflow = Math.max(overflow, document.documentElement.scrollWidth - document.documentElement.clientWidth);
      await new Promise(requestAnimationFrame);
    }
    return { overflow, sawFlip };
  });
  expect(result.sawFlip).toBe(true);
  expect(result.overflow).toBe(0);
});
