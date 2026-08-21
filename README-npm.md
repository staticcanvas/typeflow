# @staticcanvas/typeflow

A lightweight, interruptible, framework-agnostic typewriter animation library. Zero dependencies, safe HTML tag balancing, `Intl.Segmenter` powered grapheme/word units, bidirectional erasing, sequence orchestration, and framework adapters.

[![npm version](https://img.shields.io/npm/v/@staticcanvas/typeflow.svg)](https://www.npmjs.com/package/@staticcanvas/typeflow)
[![license](https://img.shields.io/npm/l/@staticcanvas/typeflow.svg)](https://gitlab.com/staticcanvas/typeflow)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@staticcanvas/typeflow)](https://bundlephobia.com/package/@staticcanvas/typeflow)

---

## Highlights

- **Zero Dependencies**: Pure ECMAScript with native DOM batching (<5KB gzipped).
- **Safe HTML**: Parses structured markup without breaking tags or exposing script vectors.
- **Intl.Segmenter**: International character cluster and compound emoji safety (`🚀`, `👨‍👩‍👧‍👦`).
- **Scramble / Decrypt Reveals**: Cyberpunk glyph matrix reveals (`typeStyle: 'scramble'`).
- **Granularity & Cadence**: Word-by-word streaming and natural punctuation pacing.
- **Bidirectional Erasing**: Backspace (`end`), left-erosion (`start`), `scramble`, `fade`, or `instant`.
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

// 1. Basic Typewriter with Natural Cadence
TypeFlow.type('#headline', 'Fast. Resilient. Zero dependencies.', {
  speed: 40,
  naturalCadence: true,
  cursor: '|'
});

// 2. Scramble / Decrypt Effect
TypeFlow.type('#terminal', 'SYSTEM ONLINE', {
  typeStyle: 'scramble',
  scrambleRounds: 2
});

// 3. Sequential Multi-Step Orchestration
TypeFlow.sequence([
  seq.visible('#step-1'), // Waits until element scrolls into view
  seq.type('#step-1', 'Initializing kernel...'),
  seq.pause(500),
  seq.erase('#step-1', { eraseStyle: 'scramble' }),
  seq.type('#step-1', 'Kernel active.')
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
TypeFlow.sequence(steps, seqConfig?): TypeFlowController
TypeFlow.rotate(target, words, config?): TypeFlowController
TypeFlow.watch(container, selector, callback): { disconnect(): void }
TypeFlow.stop(target): void
TypeFlow.stopAll(): void
TypeFlow.isTyping(target): boolean
```

---

## Documentation

Full interactive documentation, API specifications, and live workbench:  
👉 **[https://staticcanvas.gitlab.io/typeflow](https://staticcanvas.gitlab.io/typeflow)**

---

## License

MIT © Garvey K. Snow
