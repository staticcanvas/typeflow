import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { arch, cpus, platform, release } from 'node:os';
import { performance } from 'node:perf_hooks';
import { gzipSync } from 'node:zlib';
import { JSDOM } from 'jsdom';

const args = new Set(process.argv.slice(2));
const isMarkdownMode = args.has('--markdown') || args.has('-m') || args.has('--md');
const isJsonMode = args.has('--json') || args.has('-j');
const isQuickMode = args.has('--quick');
const numericArg = (name, fallback) => {
  const raw = [...args].find((value) => value.startsWith(`${name}=`))?.split('=')[1];
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};
const sampleCount = numericArg('--samples', isQuickMode ? 3 : 7);
const warmupCount = numericArg('--warmup', isQuickMode ? 1 : 2);
const payloadTiers = [10_000, 50_000, 100_000];
const concurrencyTiers = isQuickMode ? [1, 10, 50, 100] : [1, 10, 25, 50, 100, 250, 500, 1_000];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(performance.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.window.matchMedia = (query) => ({
  matches: query.includes('prefers-reduced-motion'),
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => true,
});

const { TypeFlow } = await import(new URL('../src/typeflow.js', import.meta.url).href);
const targets = new Set();
const createTarget = () => {
  const target = document.createElement('div');
  document.body.append(target);
  targets.add(target);
  return target;
};
const clearTargets = () => {
  TypeFlow.stopAll();
  targets.forEach((target) => target.remove());
  targets.clear();
};

const percentile = (sorted, fraction) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
const summarize = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
  const middle = Math.floor(sorted.length / 2);
  return {
    minimum: sorted[0],
    median: sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2,
    p95: percentile(sorted, 0.95),
    maximum: sorted.at(-1),
    standardDeviation: Math.sqrt(variance),
  };
};

const measure = async ({ scenario, tier, units = 'characters', operation }) => {
  for (let index = 0; index < warmupCount; index += 1) {
    await operation();
    clearTargets();
  }

  const durations = [];
  const heapDeltas = [];
  for (let index = 0; index < sampleCount; index += 1) {
    globalThis.gc?.();
    const heapBefore = process.memoryUsage().heapUsed;
    const startedAt = performance.now();
    await operation();
    durations.push(performance.now() - startedAt);
    heapDeltas.push((process.memoryUsage().heapUsed - heapBefore) / 1024);
    clearTargets();
  }

  return {
    scenario,
    tier,
    units,
    samples: sampleCount,
    durationMs: summarize(durations),
    heapDeltaKiB: summarize(heapDeltas),
  };
};

const plainPayload = (length) => 'TypeFlow reveals accessible text without changing its final content. '.repeat(Math.ceil(length / 66)).slice(0, length);
const htmlUnit = '<span>TypeFlow <strong>reveals</strong> <em class="accent">safe HTML</em>.</span>';
const htmlPayload = (minimumLength) => htmlUnit.repeat(Math.ceil(minimumLength / htmlUnit.length));
const immediate = { speed: 0, delay: 0, cursor: '', cursorBlink: false, respectReducedMotion: true };
const results = [];

for (const tier of payloadTiers) {
  const plain = plainPayload(tier);
  const html = htmlPayload(tier);

  results.push(await measure({
    scenario: 'plain-text-final-render',
    tier: plain.length,
    operation: async () => {
      const target = createTarget();
      await TypeFlow.type(target, plain, immediate).promise;
      if (target.textContent !== plain) throw new Error('plain-text benchmark produced incorrect output');
    },
  }));

  results.push(await measure({
    scenario: 'word-segmentation-final-render',
    tier: plain.length,
    operation: async () => {
      const target = createTarget();
      await TypeFlow.type(target, plain, { ...immediate, typeStyle: 'word' }).promise;
      if (target.textContent !== plain) throw new Error('word benchmark produced incorrect output');
    },
  }));

  results.push(await measure({
    scenario: 'safe-html-parse-and-final-render',
    tier: html.length,
    operation: async () => {
      const target = createTarget();
      await TypeFlow.type(target, html, { ...immediate, html: true }).promise;
      if (!target.querySelector('strong')) throw new Error('HTML benchmark lost allowed markup');
    },
  }));

  results.push(await measure({
    scenario: 'morph-final-render',
    tier: plain.length,
    operation: async () => {
      const target = createTarget();
      target.textContent = `Before: ${plain}`;
      await TypeFlow.morph(target, `After: ${plain}`, immediate).promise;
      if (target.textContent !== `After: ${plain}`) throw new Error('morph benchmark produced incorrect output');
    },
  }));

  results.push(await measure({
    scenario: 'instant-erase',
    tier: plain.length,
    operation: async () => {
      const target = createTarget();
      target.textContent = plain;
      await TypeFlow.erase(target, { eraseStyle: 'instant', cursorBlink: false }).promise;
      if (target.textContent !== '') throw new Error('erase benchmark did not clear its target');
    },
  }));
}

for (const tier of concurrencyTiers) {
  const text = plainPayload(80);
  results.push(await measure({
    scenario: 'concurrent-short-instances',
    tier,
    units: 'instances',
    operation: async () => {
      const controllers = Array.from({ length: tier }, () => TypeFlow.type(createTarget(), text, immediate));
      const completed = await Promise.all(controllers.map(({ promise }) => promise));
      if (!completed.every((result) => result.completed)) throw new Error('concurrent benchmark did not complete');
    },
  }));
}

const bundlePath = new URL('../dist/typeflow/dist/typeflow.min.js', import.meta.url);
const bundle = existsSync(bundlePath) ? readFileSync(bundlePath) : null;
const commit = (() => {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
})();
const cpu = cpus();
const report = {
  schemaVersion: 1,
  benchmarkKind: 'synthetic-jsdom',
  generatedAt: new Date().toISOString(),
  commit,
  environment: {
    node: process.version,
    jsdom: dom.window.navigator.userAgent,
    platform: platform(),
    release: release(),
    architecture: arch(),
    cpuModel: cpu[0]?.model ?? 'unknown',
    logicalCpuCount: cpu.length,
    sampleCount,
    warmupCount,
    garbageCollectionExposed: typeof globalThis.gc === 'function',
  },
  limitations: [
    'JSDOM results compare engine work and do not measure browser layout, paint, frame rate, GPU compositing, or supported production capacity.',
    'Concurrent-instance results are synthetic completion costs; active-instance limits require the separate real-browser benchmark.',
  ],
  bundle: bundle ? { rawBytes: bundle.byteLength, gzipBytes: gzipSync(bundle).byteLength } : null,
  results,
};

const format = (value) => Number(value).toFixed(2);
if (isJsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else if (isMarkdownMode) {
  console.log(`## Synthetic JSDOM benchmark\n\nThis table reports median and p95 engine completion time across ${sampleCount} measured samples after ${warmupCount} warm-up runs. It does not represent browser frame-rate or production capacity.\n\n| Scenario | Tier | Median | p95 | Median heap delta |\n| :--- | ---: | ---: | ---: | ---: |`);
  for (const result of results) {
    console.log(`| ${result.scenario} | ${result.tier.toLocaleString()} ${result.units} | ${format(result.durationMs.median)} ms | ${format(result.durationMs.p95)} ms | ${format(result.heapDeltaKiB.median)} KiB |`);
  }
  console.log(`\nEnvironment: Node ${report.environment.node}; ${report.environment.platform} ${report.environment.release}; ${report.environment.cpuModel}; commit ${commit ?? 'unavailable'}.`);
} else {
  console.log(`TypeFlow synthetic JSDOM benchmark (${sampleCount} samples, ${warmupCount} warm-ups)`);
  console.table(results.map((result) => ({
    scenario: result.scenario,
    tier: `${result.tier.toLocaleString()} ${result.units}`,
    medianMs: format(result.durationMs.median),
    p95Ms: format(result.durationMs.p95),
    medianHeapKiB: format(result.heapDeltaKiB.median),
  })));
  console.log('Capacity note: use real-browser frame, long-task, and heap measurements before documenting active-instance limits.');
}

dom.window.close();
