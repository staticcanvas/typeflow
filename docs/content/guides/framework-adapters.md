---
title: Framework adapters
description: Lightweight zero-dependency adapter factories and integration hooks for React, Vue 3, Svelte, Solid.js, Alpine.js, Web Components, and Angular.
eyebrow: Guides
category: Guides
keywords:
  - react
  - vue
  - svelte
  - solid
  - alpine
  - astro
  - web components
  - custom elements
  - angular
  - hooks
  - useTypeFlow
  - components
  - adapters
  - frameworks
---

## Zero-Dependency Framework Adapters

TypeFlow utilizes factory-driven adapter functions. By accepting the host framework runtime as an injection argument (or leveraging standard browser DOM primitives), TypeFlow provides reactive hooks and directives without bloating your production bundle with framework peer dependencies.

All adapters handle automatic animation teardown, component unmounting, and signal dependency tracking.

---

## React Adapter

The React adapter provides two custom hooks: `useTypeFlow` for reactive text rendering and `useTypeFlowSequence` for multi-step sequence orchestration.

```jsx
import React, { useState } from 'react';
import { createTypeFlowReact, createTypeFlowSequenceReact, seq } from '@staticcanvas/typeflow';

// Initialize adapter hooks by injecting React instance
const useTypeFlow = createTypeFlowReact(React);
const useTypeFlowSequence = createTypeFlowSequenceReact(React);

export function HeroTitle() {
  const [headline] = useState('TypeFlow with React Hooks');

  // Binds animation to DOM node ref
  const headlineRef = useTypeFlow(headline, {
    speed: 35,
    cursor: '|',
    cursorBlink: true,
  });

  return <h1 ref={headlineRef} />;
}

export function SequenceDemo() {
  useTypeFlowSequence(
    () => [
      seq.type('#seq-target', 'First step complete.'),
      seq.pause(600),
      seq.erase('#seq-target', { eraseStyle: 'center' }),
      seq.type('#seq-target', 'Second step rendered.'),
    ],
    []
  );

  return <div id="seq-target" />;
}
```

---

## Vue 3 Adapter

The Vue 3 adapter integrates with Vue's reactivity system via getter functions, automatically updating when source refs or computed properties change.

```vue
<script setup>
import * as Vue from 'vue';
import { createTypeFlowVue, createTypeFlowSequenceVue, seq } from '@staticcanvas/typeflow';

const useTypeFlow = createTypeFlowVue(Vue);
const useTypeFlowSequence = createTypeFlowSequenceVue(Vue);

const message = Vue.ref('Reactive Vue 3 Typography');
const headlineRef = useTypeFlow(() => message.value, {
  speed: 40,
  cursor: '▍',
});

const runSequence = useTypeFlowSequence(() => [
  seq.type(headlineRef.value, 'Vue Sequence Step 1'),
  seq.pause(400),
  seq.erase(headlineRef.value),
  seq.type(headlineRef.value, 'Vue Sequence Step 2'),
]);
</script>

<template>
  <h1 ref="headlineRef"></h1>
  <button @click="runSequence">Replay Sequence</button>
</template>
```

---

## Svelte Adapter (Action)

The Svelte adapter implements the standard Svelte action contract (`node, params => { update, destroy }`). It works in both Svelte 4 and Svelte 5 runes.

```svelte
<script>
  import { createTypeFlowSvelte } from '@staticcanvas/typeflow';
  const typeflow = createTypeFlowSvelte();

  let text = 'Reactive Svelte Action';
</script>

<h1 use:typeflow={{ text, config: { speed: 35, cursor: '|' } }}></h1>
```

---

## Solid.js Adapter

The Solid.js adapter integrates directly with fine-grained signal accessors and `createEffect` tracking.

```jsx
import * as Solid from 'solid-js';
import { createTypeFlowSolid } from '@staticcanvas/typeflow';

const useTypeFlow = createTypeFlowSolid(Solid);

export function Hero() {
  const [headline, setHeadline] = Solid.createSignal('Solid.js Reactive Typography');
  const ref = useTypeFlow(headline, {
    speed: 35,
    cursor: '|',
  });

  return <h1 ref={ref} />;
}
```

---

## Alpine.js Adapter (Directive)

The Alpine adapter registers a custom `x-typeflow` directive that monitors expression updates and manages animation cleanup automatically.

```html
<script type="module">
  import Alpine from 'alpinejs';
  import { createTypeFlowAlpine } from '@staticcanvas/typeflow';

  createTypeFlowAlpine(Alpine);
  Alpine.start();
</script>

<div x-data="{ title: 'Alpine.js Fluid Typography' }">
  <h1 x-typeflow="{ text: title, config: { speed: 30, cursor: '|' } }"></h1>
</div>
```

---

## Web Components / Custom Element

TypeFlow provides a native autonomous custom element `<type-flow>` compatible with any HTML page, CMS, or framework template without bundlers.

```html
<script type="module">
  import { defineTypeFlowElement } from '@staticcanvas/typeflow';
  defineTypeFlowElement();
</script>

<!-- Declarative HTML markup -->
<type-flow
  text="Declarative Web Component Typography"
  speed="35"
  direction="center"
  type-style="char"
  cursor="■"
></type-flow>
```

### Custom Element Attributes

| Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `text` | `string` | Element inner text | Source text to reveal. |
| `speed` | `number` | `40` | Milliseconds per character delay. |
| `direction` | `"left" \| "right" \| "center"` | `"left"` | Typing reveal vector. |
| `type-style` | `"char" \| "word" \| "scramble" \| "fade-trail"` | `"char"` | Reveal presentation style. |
| `erase-style` | `"end" \| "start" \| "center" \| "scramble"` | `"end"` | Erase animation style. |
| `cursor` | `string` | `"\|"` | Active cursor glyph. |
| `scramble-charset` | `string` | `"matrix"` | Preset name for decrypt animations. |
| `audio` | `"mechanical" \| "beep" \| "synth"` | `undefined` | Web Audio sound profile. |

---

## Astro Integration

Astro does not require a separate TypeFlow adapter. Use the browser-native ESM API inside a client island or use the native `<type-flow>` custom element. Keep DOM access in a client-side script; Astro's server-rendered HTML must not call `TypeFlow.type()` during SSR.

```astro
---
const text = 'Astro island typography';
---

<h1 id="astro-headline">{text}</h1>

<script>
  import { TypeFlow } from '@staticcanvas/typeflow';

  const target = document.querySelector('#astro-headline');
  if (target) TypeFlow.type(target, target.textContent ?? '', { speed: 40 });
</script>
```

For reusable Astro islands, place the animation in a client framework component and render it with an Astro client directive such as `client:load`. No Astro-specific runtime package is bundled or required.

---

## Angular Integration Recipe

In Angular applications, TypeFlow can be encapsulated in a reusable attribute directive:

```typescript
import { Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { TypeFlow, TypeFlowConfig, TypeFlowController } from '@staticcanvas/typeflow';

@Directive({
  selector: '[appTypeFlow]',
  standalone: true,
})
export class TypeFlowDirective implements OnChanges, OnDestroy {
  @Input('appTypeFlow') text = '';
  @Input() typeFlowConfig: TypeFlowConfig = {};

  private controller: TypeFlowController | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['text'] || changes['typeFlowConfig']) {
      this.controller?.stop();
      this.controller = TypeFlow.type(this.el.nativeElement, this.text, this.typeFlowConfig);
    }
  }

  ngOnDestroy(): void {
    this.controller?.stop();
  }
}
```

---

## Integration Compatibility Matrix

| Target Ecosystem | Integration Method | Teardown Handling | SSR Safe |
| :--- | :--- | :--- | :--- |
| **React** (v16.8+) | Hook (`useTypeFlow`) | `useEffect` return callback | Yes |
| **Vue 3** | Hook (`useTypeFlow`) | `onBeforeUnmount` lifecycle | Yes |
| **Svelte** (v4 / v5) | Action (`use:typeflow`) | Action `destroy()` hook | Yes |
| **Solid.js** | Hook (`useTypeFlow`) | `onCleanup` hook | Yes |
| **Alpine.js** (v3+) | Directive (`x-typeflow`) | Directive `cleanup()` hook | Yes |
| **Web Components** | Custom Element (`<type-flow>`) | `disconnectedCallback()` | Yes |
| **Astro** | Client-side ESM or `<type-flow>` | Browser lifecycle / custom-element disconnect | Yes, when client-rendered |
| **Angular** (v14+) | Standalone Directive | `ngOnDestroy()` | Yes |

Angular is documented as an integration recipe rather than a built-in adapter factory. Astro likewise uses TypeFlow's framework-agnostic browser API rather than a separate Astro package.

