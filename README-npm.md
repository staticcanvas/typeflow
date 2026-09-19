![TypeFlow Banner](https://r2os.staticcanvas.me/logos/typeflow/dist/webp/typeflow-logo-64x64.webp)

# **@staticcanvas/typeflow**

[![npm-version](https://img.shields.io/npm/v/@staticcanvas/typeflow?style=flat-square&color=%2342275a)](https://www.npmjs.com/package/@staticcanvas/typeflow)
[![jsr-version](https://img.shields.io/jsr/v/%40staticcanvas/typeflow?style=flat-square&logo=jsr&color=%2342275a)](https://jsr.io/%40staticcanvas/typeflow)
[![codecov](https://codecov.io/gl/staticcanvas/typeflow/branch/v0.34.4-release/graph/badge.svg?token=)](https://codecov.io/gl/staticcanvas/typeflow)
[![license](https://img.shields.io/npm/l/@staticcanvas/typeflow?style=flat-square&color=%2342275a)](https://gitlab.com/staticcanvas/typeflow)

> **TypeFlow** is a lightweight, interruptible, framework-agnostic typewriter animation library designed for modern web applications and static sites.

---

## Highlights

- **Zero Dependencies**: Pure ECMAScript with native DOM batching (<10.25 KiB gzipped).
- **Safe HTML**: Parses structured markup without breaking tags or exposing script vectors.
- **Intl.Segmenter**: International character cluster and compound emoji safety (`🚀`, `👨‍👩‍👧‍👦`).
- **Multi-Directional Reveals**: Type left-to-right, right-to-left, or middle-outward (`direction: 'center'`).
- **Directional Erasing**: Backspace (`end`), left-erosion (`start`), inward shrink (`center`), `scramble`, `fade`, or `instant`.
- **Scramble Charset Presets**: Built-in glyph presets (`matrix`, `blocks`, `ascii`, `ascii-extended`, `binary`, `hex`, `braille`, `runic`, `cyber`).
- **Procedural Web Audio**: Built-in zero-asset keystrokes (`mechanical`, `beep`, `synth`).
- **Smart Morph Diffing**: Diff-erases only changed suffixes (`TypeFlow.morph()`).
- **Real-Time Stream Ingestion**: FIFO chunk stream buffer for LLM token streams (`TypeFlow.stream()`).
- **Animation Presets**: One-line profiles for common styles (`TypeFlow.preset('cyberpunk')`).
- **CLS Layout Shift Prevention**: Automatic dimension stabilization (`TypeFlow.fit()`).
- **Sequence Orchestration**: Coordinate multi-step flows with `seq.type`, `seq.erase`, `seq.pause`, `seq.visible`, and `seq.call`.
- **Framework Ready**: First-class adapters for React, Vue, Svelte, Solid.js, and Alpine.js, plus native Web Components and Astro client-side integration.

---

## Installation

```bash
# npm
npm install @staticcanvas/typeflow

# pnpm
pnpm add @staticcanvas/typeflow

# JSR
npx jsr add @staticcanvas/typeflow
```

---

## Quickstart

### Vanilla JavaScript

```javascript
import { TypeFlow, seq } from '@staticcanvas/typeflow';

// 1. Basic Typewriter with Natural Cadence & Procedural Audio
TypeFlow.type('#headline', 'Fast. Resilient. Zero dependencies.', {
  speed: 40,
  naturalCadence: true,
  audio: 'mechanical',
  cursor: '|',
});

// 2. Scramble / Decrypt Effect with Presets
TypeFlow.type('#terminal', 'SYSTEM ONLINE', TypeFlow.preset('cyberpunk'));

// 3. Smart Morph Diffing
await TypeFlow.type('#target', 'Hello World');
await TypeFlow.morph('#target', 'Hello Universe');

// 4. Real-Time Stream Ingestion
const stream = TypeFlow.stream('#ai-output', { speed: 15 });
stream.push('First token chunk ');
stream.push('Second token chunk');

// 5. Sequential Multi-Step Orchestration
TypeFlow.sequence([
  seq.visible('#step-1'), // Waits until element scrolls into view
  seq.type('#step-1', 'Initializing kernel...'),
  seq.pause(500),
  seq.erase('#step-1', { eraseStyle: 'center' }),
  seq.type('#step-1', 'Kernel active.'),
]);
```

---

## Framework Adapters

### React

```jsx
import React from 'react';
import { createTypeFlowReact } from '@staticcanvas/typeflow';

const useTypeFlow = createTypeFlowReact(React);

export function Headline() {
  const headlineRef = useTypeFlow('Modern React Typewriter', { speed: 40 });
  return <h1 ref={headlineRef} />;
}
```

### Vue

```vue
<script setup>
import * as Vue from 'vue';
import { createTypeFlowVue } from '@staticcanvas/typeflow';

const useTypeFlow = createTypeFlowVue(Vue);
const message = Vue.ref('Reactive Typewriter');
const ref = useTypeFlow(() => message.value, { speed: 45 });
</script>

<template>
  <h1 ref="ref"></h1>
</template>
```

### Svelte

```svelte
<script>
  import { createTypeFlowSvelte } from '@staticcanvas/typeflow';
  const typeflow = createTypeFlowSvelte();
</script>

<h1 use:typeflow={{ text: 'Svelte Action', config: { speed: 40 } }}></h1>
```

### Solid.js

```jsx
import * as Solid from 'solid-js';
import { createTypeFlowSolid } from '@staticcanvas/typeflow';

const useTypeFlow = createTypeFlowSolid(Solid);

export function Hero() {
  const [text] = Solid.createSignal('Solid Typography');
  const ref = useTypeFlow(text, { speed: 40 });
  return <h1 ref={ref} />;
}
```

### Alpine.js

```html
<script type="module">
  import Alpine from 'alpinejs';
  import { createTypeFlowAlpine } from '@staticcanvas/typeflow';

  createTypeFlowAlpine(Alpine);
  Alpine.start();
</script>

<div x-data="{ title: 'Alpine.js Typography' }">
  <h1 x-typeflow="{ text: title, config: { speed: 40 } }"></h1>
</div>
```

### Astro and Web Components

Astro uses the browser-native ESM API from a client-side script or client island; it does not need a separate Astro runtime adapter. The native `<type-flow>` custom element is also available when a declarative integration is preferred. See the [framework adapter guide](https://staticcanvas.gitlab.io/typeflow/guides/framework-adapters/) for complete Astro and Web Components examples.

---

## API Summary

```typescript
// Core Engine
TypeFlow.type(target, text, config?): TypeFlowController
TypeFlow.erase(target, config?): TypeFlowController
TypeFlow.morph(target, nextText, config?): TypeFlowController
TypeFlow.stream(target, config?): TypeFlowStreamController
TypeFlow.preset(name, overrides?): TypeFlowConfig
TypeFlow.fit(target, candidates): void
TypeFlow.stagger(targets, texts?, config?): TypeFlowController
TypeFlow.sequence(steps, seqConfig?): TypeFlowController
TypeFlow.rotate(target, words, config?): TypeFlowController
TypeFlow.watch(container, selector, callback): { disconnect(): void }
TypeFlow.stop(target): void
TypeFlow.stopAll(): void
TypeFlow.isTyping(target): boolean

// Companion Subpaths:
// @staticcanvas/typeflow/metrics   -> TypeFlowMetrics
// @staticcanvas/typeflow/debug     -> TypeFlowDebug
// @staticcanvas/typeflow/webaudio  -> TypeFlowWebAudio, createKeystrokeAudio
// @staticcanvas/typeflow/keystroke -> TypeFlowKeystroke, calculateKeyDistance
// @staticcanvas/typeflow/extchars  -> TypeFlowExtChars, getExtendedCharset
```

---

## Development & NPM Scripts

| Script                       | Command                                                                         | Description                                                 |
| :--------------------------- | :------------------------------------------------------------------------------ | :---------------------------------------------------------- |
| **`npm run dev`**            | `vite`                                                                          | Starts local Vite development server.                       |
| **`npm run build`**          | `vite build`                                                                    | Compiles production ESM, CJS, and UMD bundles into `dist/`. |
| **`npm test`**               | `vitest run`                                                                    | Runs the full unit test suite.                              |
| **`npm run benchmark`**      | `node --expose-gc scripts/run-benchmark.mjs`                                    | Runs repeated 10k, 50k, 100k, and concurrency benchmarks.   |
| **`npm run benchmark:md`**   | `node --expose-gc scripts/run-benchmark.mjs --markdown`                         | Generates a Markdown benchmark table.                       |
| **`npm run benchmark:json`** | `node --expose-gc scripts/run-benchmark.mjs --json`                             | Generates machine-readable benchmark data.                  |
| **`npm run check:quality`**  | `npm run validate:docs-data && npm run build && npm run check:size && npm test` | Runs deterministic release checks.                          |

---

## Benchmarks

The JSDOM suite uses warm-up rounds and seven measured samples at 10,000, 50,000, and 100,000 characters. It reports minimum, median, p95, maximum, standard deviation, and heap delta for plain text, word segmentation, safe HTML, morph, and instant erase operations. It also measures 1–1,000 concurrent short instances.

These synthetic results do not measure browser layout, paint, frame rate, long tasks, or GPU composition and therefore do not define a supported browser instance limit.

```bash
npm run benchmark:md
npm run --silent benchmark:json > typeflow-benchmark.json
```

---

## Documentation

Full interactive documentation, API specifications, and live workbench:
👉 **[https://staticcanvas.gitlab.io/typeflow](https://staticcanvas.gitlab.io/typeflow)**

---

### **License**

Distributed under the **MIT License**. See `LICENSE` for more information.
