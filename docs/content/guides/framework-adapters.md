---
title: Framework adapters
description: First-class lightweight adapter hooks for React and Vue applications.
eyebrow: Guides
---

## Zero-Dependency Framework Adapters

TypeFlow uses adapter factory functions to avoid bundling framework runtimes.

## React Adapter

```jsx
import React from 'react';
import { createTypeFlowReact, createTypeFlowSequenceReact, seq } from '@staticcanvas/typeflow';

const useTypeFlow = createTypeFlowReact(React);
const useTypeFlowSequence = createTypeFlowSequenceReact(React);

export function HeroTitle() {
  const headlineRef = useTypeFlow('Fast. Scalable. Safe.', {
    speed: 40,
    cursor: '|'
  });

  return <h1 ref={headlineRef} />;
}
```

## Vue Adapter

```vue
<script setup>
import * as Vue from 'vue';
import { createTypeFlowVue } from '@staticcanvas/typeflow';

const useTypeFlow = createTypeFlowVue(Vue);

const message = Vue.ref('Reactive Typewriter');
const headlineRef = useTypeFlow(() => message.value, { speed: 45 });
</script>

<template>
  <h1 ref="headlineRef"></h1>
</template>
```

## Svelte Adapter (Action)

```svelte
<script>
  import { createTypeFlowSvelte } from '@staticcanvas/typeflow';
  const typeflow = createTypeFlowSvelte();
</script>

<h1 use:typeflow={{ text: 'Reactive Svelte Action', config: { speed: 40 } }}></h1>
```

## Solid.js Adapter

```jsx
import * as Solid from 'solid-js';
import { createTypeFlowSolid } from '@staticcanvas/typeflow';

const useTypeFlow = createTypeFlowSolid(Solid);

export function Hero() {
  const [headline, setHeadline] = Solid.createSignal('Solid.js Reactive Typography');
  const ref = useTypeFlow(headline, { speed: 40 });

  return <h1 ref={ref} />;
}
```

