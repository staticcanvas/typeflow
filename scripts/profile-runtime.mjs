import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from '@playwright/test';

const root = join(process.cwd(), 'public');
const server = createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = normalize(join(root, pathname.endsWith('/') ? `${pathname}index.html` : pathname));
  if (!file.startsWith(root)) { response.writeHead(403).end(); return; }
  try {
    const payload = readFileSync(file);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
    response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(payload);
  } catch { response.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ args: ['--js-flags=--expose-gc'] });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/`);

const result = await page.evaluate(async () => {
  const measure = async (name, operation) => {
    globalThis.gc?.();
    const heapBefore = performance.memory?.usedJSHeapSize ?? null;
    const started = performance.now();
    await operation();
    const durationMs = performance.now() - started;
    const heapAfter = performance.memory?.usedJSHeapSize ?? null;
    return { name, durationMs, heapDeltaBytes: heapBefore === null ? null : heapAfter - heapBefore };
  };
  const source = 'TypeFlow 👩🏽‍💻 حالة 世界 Cafe\u0301. '.repeat(400);
  const template = document.createElement('template');
  template.innerHTML = `<span><strong>${source}</strong><em>${source}</em></span>`;
  const rows = [];
  rows.push(await measure('segmentation-grapheme', () => Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(source))));
  rows.push(await measure('segmentation-word', () => Array.from(new Intl.Segmenter(undefined, { granularity: 'word' }).segment(source))));
  rows.push(await measure('sanitized-tree-cloning', () => { for (let index = 0; index < 200; index += 1) template.content.cloneNode(true); }));
  const target = document.createElement('div');
  document.body.appendChild(target);
  rows.push(await measure('replaceChildren-text', () => { for (let index = 0; index < 500; index += 1) target.replaceChildren(document.createTextNode(source.slice(0, index))); }));
  rows.push(await measure('style-and-layout', () => {
    for (let index = 0; index < 500; index += 1) {
      target.style.transform = `translateX(${index % 2}px)`;
      target.getBoundingClientRect();
    }
  }));
  rows.push(await measure('paint-frame-settlement', async () => {
    for (let index = 0; index < 30; index += 1) {
      target.style.opacity = String((index % 10) / 10);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }));
  rows.push(await measure('timer-dispatch', () => Promise.all(Array.from({ length: 200 }, () => new Promise((resolve) => setTimeout(resolve, 0))))));
  rows.push(await measure('node-allocation', () => { for (let index = 0; index < 2000; index += 1) document.createTextNode(String(index)); }));
  const { TypeFlow } = await import('/webutil/libs/typeflow.esm.js');
  let replaceCalls = 0;
  const originalReplace = Element.prototype.replaceChildren;
  Element.prototype.replaceChildren = function (...nodes) { replaceCalls += 1; return originalReplace.apply(this, nodes); };
  rows.push(await measure('typeflow-ast-window-end-to-end', async () => {
    await TypeFlow.type(target, `<strong>${source.slice(0, 200)}</strong>`, { html: true, speed: 0, cursor: '', respectReducedMotion: false }).promise;
  }));
  Element.prototype.replaceChildren = originalReplace;
  return { userAgent: navigator.userAgent, replaceChildrenCalls: replaceCalls, rows };
});

await browser.close();
server.close();
const report = { schemaVersion: 1, generatedAt: new Date().toISOString(), ...result };
mkdirSync(join(process.cwd(), 'benchmarks', 'results'), { recursive: true });
writeFileSync(join(process.cwd(), 'benchmarks', 'results', 'runtime-profile.json'), `${JSON.stringify(report, null, 2)}\n`);
const rows = result.rows.map(({ name, durationMs, heapDeltaBytes }) => `| ${name} | ${durationMs.toFixed(2)} ms | ${heapDeltaBytes ?? 'n/a'} |`).join('\n');
writeFileSync(join(process.cwd(), 'benchmarks', 'results', 'runtime-profile.md'), `# Runtime path profile\n\nChromium profile separating segmentation, cloning, DOM replacement, style/layout, paint-frame, timer, and allocation work. The end-to-end AST-window scenario called replaceChildren ${result.replaceChildrenCalls} times.\n\n| Path | Wall time | Heap delta (bytes) |\n| :--- | ---: | ---: |\n${rows}\n\nEnvironment: ${result.userAgent}. Generated ${report.generatedAt}.\n`);
console.log(rows);
