import { test, expect } from '@playwright/test';

const snippetText = (page) => page.locator('#pg-code-snippet').textContent();

const expectValidModuleSnippet = async (page) => {
  const code = await snippetText(page);
  const executable = code.replace(/^import .*;$/gm, '');
  const valid = await page.evaluate((source) => {
    try {
      new Function(`return async () => {\n${source}\n};`);
      return true;
    } catch {
      return false;
    }
  }, executable);
  expect(valid).toBe(true);
};

test('desktop TOC scrolls independently and keeps the active entry in view', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 480 });
  await page.goto('/api/');

  const toc = page.locator('.doc-toc');
  await expect(toc).toBeVisible();
  const dimensions = await toc.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    overflowY: getComputedStyle(element).overflowY,
  }));
  expect(dimensions.overflowY).toBe('auto');
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);

  const finalLink = toc.locator('a').last();
  const href = await finalLink.getAttribute('href');
  // The active-heading observer watches the 20–30% viewport band.
  await page.locator(href).evaluate(element => {
    window.scrollBy({ top: element.getBoundingClientRect().top - window.innerHeight * 0.25, behavior: 'instant' });
  });
  await expect(finalLink).toHaveClass(/toc-active/);
  await expect.poll(() => toc.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

  await expect.poll(() => finalLink.evaluate((link) => {
    const rail = link.closest('.doc-toc').getBoundingClientRect();
    const bounds = link.getBoundingClientRect();
    return Math.max(rail.top - bounds.top, bounds.bottom - rail.bottom);
  })).toBeLessThanOrEqual(1);
});

test.describe('playground copy-ready code', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground/');
    await expect.poll(() => page.evaluate(() => Boolean(window.TypeFlow))).toBe(true);
  });

  test('generates compatible type and erase configurations', async ({ page, context }) => {
    await expect(page.locator('#pg-code-operation')).toHaveText('TypeFlow.type()');
    let code = await snippetText(page);
    expect(code).toContain("import { TypeFlow } from '@staticcanvas/typeflow';");
    expect(code).toContain("document.querySelector('#target')");
    expect(code).toContain('TypeFlow.type(target');
    expect(code).not.toContain('eraseStyle');
    await expectValidModuleSnippet(page);

    await page.locator('#pg-type-style').selectOption('scramble');
    await page.locator('#pg-scramble-charset').selectOption('hieroglyphs');
    code = await snippetText(page);
    expect(code).toContain('"scrambleGlyphs"');
    expect(code).toContain('𓀀𓀁');
    expect(code).not.toContain('"scrambleCharset": "hieroglyphs"');
    await expect(page.locator('#pg-word-order')).toBeDisabled();
    await expectValidModuleSnippet(page);

    await page.locator('#pg-erase-style').selectOption('fade-trail');
    await expect(page.locator('#pg-code-operation')).toHaveText('TypeFlow.erase()');
    code = await snippetText(page);
    expect(code).toContain('TypeFlow.erase(target, options)');
    expect(code).toContain('"eraseStyle": "fade-trail"');
    expect(code).toContain('"trailFade"');
    expect(code).not.toContain('"typeStyle"');
    expect(code).not.toContain('"direction"');
    await expect(page.locator('#pg-fade-trail-len')).toBeEnabled();
    await expect(page.locator('#pg-scramble-charset')).toBeDisabled();
    await expectValidModuleSnippet(page);

    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('#pg-btn-copy-code').click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(code);
  });

  test('emits the API selected by each action with complete companion setup', async ({ page }) => {
    await page.locator('#pg-btn-morph').click();
    await expect(page.locator('#pg-code-operation')).toHaveText('TypeFlow.morph()');
    expect(await snippetText(page)).toContain('TypeFlow.morph(target');
    await expectValidModuleSnippet(page);

    await page.reload();
    await page.locator('#pg-audio').selectOption('soundtrack');
    await page.locator('#pg-metrics-toggle').check();
    await page.locator('#pg-debug-toggle').check();
    await page.locator('#pg-btn-stream').click();
    await expect(page.locator('#pg-code-operation')).toHaveText('TypeFlow.stream()');
    const streamCode = await snippetText(page);
    expect(streamCode).toContain("from '@staticcanvas/typeflow/metrics'");
    expect(streamCode).toContain("from '@staticcanvas/typeflow/debug'");
    expect(streamCode).toContain('const soundtrack = new Audio(');
    expect(streamCode).toContain('onChunk: () =>');
    expect(streamCode).toContain('completedChunks === chunks.length');
    await expectValidModuleSnippet(page);

    await page.reload();
    await page.locator('#pg-btn-rotator').click();
    await expect(page.locator('#pg-code-operation')).toHaveText('TypeFlow.rotate()');
    const rotateCode = await snippetText(page);
    expect(rotateCode).toContain('const typeConfig =');
    expect(rotateCode).toContain('const eraseConfig =');
    expect(rotateCode).toContain('TypeFlow.rotate(target, words');
    await expectValidModuleSnippet(page);
  });
});
