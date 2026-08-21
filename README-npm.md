![Lume Banner](https://r2os.staticcanvas.me/logos/typeflow/typeflow-logo.svg)

# @staticcanvas/typeflow

A lightweight, interruptible, framework-agnostic typewriter animation library. Zero dependencies, safe HTML tag balancing, `Intl.Segmenter` powered grapheme/word units, bidirectional erasing, sequence orchestration, and framework adapters.

[![npm version](https://img.shields.io/npm/v/@staticcanvas/typeflow.svg)](https://www.npmjs.com/package/@staticcanvas/typeflow)
[![license](https://img.shields.io/npm/l/@staticcanvas/typeflow.svg)](https://gitlab.com/staticcanvas/typeflow)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@staticcanvas/typeflow)](https://bundlephobia.com/package/@staticcanvas/typeflow)

---

## Highlights

- **Zero Dependencies**: Pure ECMAScript with native DOM batching (<7KB gzipped).
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
- **Framework Ready**: First-class adapters for React, Vue, Svelte, and Solid.js.

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

| Script | Command | Description |
| :--- | :--- | :--- |
| **`npm run dev`** | `vite` | Starts local Vite development server. |
| **`npm run build`** | `vite build` | Compiles production ESM, CJS, and UMD bundles into `dist/`. |
| **`npm test`** | `vitest run` | Runs full unit test suite (34 test cases). |
| **`npm run benchmark`** | `node scripts/run-benchmark.mjs` | Runs 10k+ char synthetic benchmarks. |
| **`npm run benchmark:md`** | `node scripts/run-benchmark.mjs --markdown` | Outputs formatted Markdown benchmark table. |
| **`npm run check:quality`** | `npm run build && npm run check:size && npm run benchmark && npm test` | Runs the full QA validation pipeline. |

---

## Benchmarks

| Benchmark Scenario | Payload | Execution Time | Memory Overhead |
| :--- | :--- | :--- | :--- |
| **Plain Text Parse & Segmentation** | 10,125 chars | **20.18 ms** | +2.6 MB heap |
| **Safe HTML Parse & Allowlist Sanitize** | 10,170 chars | **145.71 ms** | <4.5 MB heap |
| **Instant Erase & DOM Reset** | 10,000 chars | **4.89 ms** | <0.1 MB heap |
| **Word Segmentation (`Intl.Segmenter`)** | 10,000 chars | **11.41 ms** | <0.1 MB heap |
| **Trailing Fade Gradient Rendering** | 10,000 chars | **3.53 ms** | <0.2 MB heap |
| **Directional Reveal Math (Center/RTL)** | 1,000 units | **< 1.00 ms** | 0 KB allocation |
| **Smart Morph Diff Calculation** | Longest common prefix | **< 0.15 ms** | 0 KB allocation |
| **Production ESM Bundle Footprint** | Minified + Gzip | **< 7.1 KB** | 0 runtime deps |

---

## Documentation

Full interactive documentation, API specifications, and live workbench:
👉 **[https://staticcanvas.gitlab.io/typeflow](https://staticcanvas.gitlab.io/typeflow)**

---

### **License**

Distributed under the **MIT License**. See `LICENSE` for more information.
