import { test, expect } from '@playwright/test';

const AFFECTED_SLOGANS = [
  {
    slogan: 'Trailing fade dissolve motion.',
    mode: 'typeStyle: fade-trail · trailFade: 6',
    typeStyle: 'fade-trail',
    eraseStyle: 'fade-trail',
    trailFade: 6,
    speed: 42,
  },
  {
    slogan: 'Stable-layout word fade reveals.',
    mode: 'typeStyle: word-fade · wordOrder: left-to-right',
    typeStyle: 'word-fade',
    eraseStyle: 'word-fade',
    wordOrder: 'left-to-right',
    wordFadeDuration: 420,
    wordStagger: 260,
    speed: 45,
  },
  {
    slogan: 'Perspective zoom word motion.',
    mode: 'typeStyle: zoom-in-space · perspective transform',
    typeStyle: 'zoom-in-space',
    eraseStyle: 'zoom-in-space',
    wordFadeDuration: 420,
    wordStagger: 260,
    speed: 45,
  },
];

test('splash forwards schema options into trailing, word-fade, and zoom animations', async ({ page }) => {
  await page.route('**/', async (route) => {
    const response = await route.fetch();
    let body = await response.text();
    body = body.replace(
      /(<script id="splash-slogans-data" type="application\/json">).*?(<\/script>)/s,
      `$1${JSON.stringify(AFFECTED_SLOGANS)}$2`,
    );
    await route.fulfill({ response, body });
  });

  await page.goto('/');
  const slogan = page.locator('#hero-slogan');
  const mode = page.locator('#hero-mode-text');

  await expect(mode).toContainText('fade-trail');
  await expect.poll(() => slogan.locator('.tf-trail').count()).toBe(6);
  await expect.poll(() => page.evaluate(() => window.TypeFlow.isTyping('#hero-slogan'))).toBe(false);
  await expect.poll(() => slogan.locator('.tf-trail').count(), { timeout: 4_000 }).toBe(6);
  await expect(slogan.locator('.tf-cursor')).toHaveCount(0);

  await expect(mode).toContainText('word-fade', { timeout: 4_000 });
  await expect(slogan.locator('.tf-word-fade[aria-hidden="true"]').first()).toBeAttached();

  await expect(mode).toContainText('zoom-in-space', { timeout: 8_000 });
  await expect.poll(() => slogan.evaluate((element) => element.style.perspective)).not.toBe('');
});
