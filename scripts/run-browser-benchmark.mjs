import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { arch, cpus, platform, release } from 'node:os';
import { chromium, firefox } from '@playwright/test';

const root = join(process.cwd(), 'public');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const relative = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  const file = normalize(join(root, relative));
  if (!file.startsWith(root)) { response.writeHead(403).end(); return; }
  try {
    const payload = readFileSync(file);
    response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' });
    response.end(payload);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const url = `http://127.0.0.1:${port}/`;
const tiers = process.argv.includes('--quick') ? [1, 10, 50] : [1, 10, 25, 50, 100];

const reports = [];
for (const [browserName, browserType] of [['chromium', chromium], ['firefox', firefox]]) {
  const browser = await browserType.launch(browserName === 'chromium' ? { args: ['--js-flags=--expose-gc'] } : {});
  const page = await browser.newPage();
  await page.goto(url);
  const userAgent = await page.evaluate(() => navigator.userAgent);
  const measurements = [];

  for (const tier of tiers) {
    measurements.push(await page.evaluate(async ({ tier }) => {
      const { TypeFlow } = await import('/webutil/libs/typeflow.esm.js');
      document.body.replaceChildren();
      globalThis.gc?.();
      const heapBefore = performance.memory?.usedJSHeapSize ?? null;
      const frames = [];
      const heapSamples = [];
      const longTasks = [];
      const scripts = [];
      let observing = true;
      let lastFrame = performance.now();
      const frame = (now) => {
        frames.push(now - lastFrame);
        lastFrame = now;
        if (performance.memory) heapSamples.push(performance.memory.usedJSHeapSize);
        if (observing) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      const observers = [];
      if (PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
        const observer = new PerformanceObserver((list) => longTasks.push(...list.getEntries().map(({ duration }) => duration)));
        observer.observe({ type: 'longtask' });
        observers.push(observer);
      }
      if (PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) scripts.push(...(entry.scripts ?? []).map(({ duration }) => duration));
        });
        observer.observe({ type: 'long-animation-frame' });
        observers.push(observer);
      }

      const text = 'TypeFlow browser capacity measurement with active frames.';
      const targets = Array.from({ length: tier }, () => document.body.appendChild(document.createElement('span')));
      const started = performance.now();
      const controllers = targets.map((target) => TypeFlow.type(target, text, {
        speed: 1,
        cursor: '',
        cursorBlink: false,
        respectReducedMotion: false,
      }));
      const settled = await Promise.all(controllers.map(({ promise }) => promise));
      const wallTimeMs = performance.now() - started;
      TypeFlow.stopAll();
      while (frames.length < 60) await new Promise((resolve) => requestAnimationFrame(resolve));
      observing = false;
      observers.forEach((observer) => observer.disconnect());
      globalThis.gc?.();
      const heapAfter = performance.memory?.usedJSHeapSize ?? null;
      const sortedFrames = [...frames].sort((a, b) => a - b);
      const p95FrameTimeMs = Number((sortedFrames[Math.max(0, Math.ceil(sortedFrames.length * 0.95) - 1)] ?? 0).toFixed(2));
      return {
        tier,
        wallTimeMs,
        scriptingTimeMs: scripts.length ? scripts.reduce((sum, value) => sum + value, 0) : null,
        domNodeCount: document.getElementsByTagName('*').length,
        heapDeltaBytes: heapBefore === null || heapAfter === null ? null : heapAfter - heapBefore,
        heapPeakBytes: heapSamples.length ? Math.max(...heapSamples) : null,
        garbageCollectionExposed: typeof globalThis.gc === 'function',
        longTasks: longTasks.filter((duration) => duration >= 50),
        droppedFrames: frames.filter((duration) => duration > 25).length,
        p95FrameTimeMs,
        frameSamples: frames.length,
        completedControllers: settled.filter(({ completed }) => completed).length,
        leakedControllers: TypeFlow.active.size,
        leakedCursorTimers: TypeFlow.cursorIntervals.size,
      };
    }, { tier }));
  }

  const eligible = measurements.filter((item) => item.p95FrameTimeMs <= 16.7
    && item.longTasks.length < 2
    && (item.heapDeltaBytes === null || item.heapDeltaBytes <= 2_000_000)
    && item.leakedControllers === 0
    && item.leakedCursorTimers === 0);
  reports.push({ browser: browserName, userAgent, measuredCapacity: eligible.at(-1)?.tier ?? 0, measurements });
  await browser.close();
}

server.close();
const report = {
  schemaVersion: 1,
  benchmarkKind: 'real-browser-active-animation',
  generatedAt: new Date().toISOString(),
  environment: { platform: platform(), release: release(), architecture: arch(), cpuModel: cpus()[0]?.model ?? 'unknown', logicalCpuCount: cpus().length },
  budgets: { p95FrameTimeMs: 16.7, repeatedLongTasks: 2, heapGrowthBytes: 2_000_000, leakedControllers: 0, leakedCursorTimers: 0 },
  methodology: 'Capacity is the highest measured tier satisfying every budget. Null metrics are unavailable in that browser and are not inferred.',
  browsers: reports,
};
mkdirSync(join(process.cwd(), 'benchmarks', 'results'), { recursive: true });
writeFileSync(join(process.cwd(), 'benchmarks', 'results', 'browser-capacity.json'), `${JSON.stringify(report, null, 2)}\n`);
const rows = reports.flatMap(({ browser, measurements }) => measurements.map((item) => `| ${browser} | ${item.tier} | ${item.wallTimeMs.toFixed(2)} ms | ${item.p95FrameTimeMs.toFixed(2)} ms | ${item.longTasks.length} | ${item.droppedFrames} | ${item.heapDeltaBytes ?? 'n/a'} | ${item.leakedControllers + item.leakedCursorTimers} |`));
const capacities = reports.map(({ browser, measuredCapacity }) => `- ${browser}: ${measuredCapacity} active instances`).join('\n');
writeFileSync(join(process.cwd(), 'benchmarks', 'results', 'browser-capacity.md'), `# Real-browser capacity benchmark\n\n${report.methodology}\n\nBudgets: p95 frame time ≤16.7 ms; fewer than two repeated ≥50 ms long tasks; heap growth ≤2,000,000 bytes where measurable; zero leaked controllers/timers.\n\n| Browser | Instances | Wall time | p95 frame | Long tasks | Dropped frames | Heap delta (bytes) | Leaks |\n| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${rows.join('\n')}\n\nDerived measured capacity:\n\n${capacities}\n\nEnvironment: ${report.environment.platform} ${report.environment.release}, ${report.environment.architecture}, ${report.environment.cpuModel}. Generated ${report.generatedAt}.\n`);
console.log(JSON.stringify(reports.map(({ browser, measuredCapacity }) => ({ browser, measuredCapacity }))));
