---
title: Framework adapters
description: First-class lightweight adapter hooks for React and Vue applications.
eyebrow: Guides
---

## Zero-Dependency Framework Adapters

To prevent bundling unnecessary framework runtimes into library consumers, TypeFlow uses adapter factory functions that accept your application's React or Vue instance.

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
