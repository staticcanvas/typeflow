---
title: API reference
description: Full specification of options, controllers, methods, and framework adapters in TypeFlow.
eyebrow: Specifications
---

## Package Exports

The `@staticcanvas/typeflow` package provides ESM, CommonJS, and UMD distributions.

| Export Path | Format | Target | Description |
| :--- | :--- | :--- | :--- |
| `@staticcanvas/typeflow` | ESM | `dist/typeflow.mjs` | Default ESM module import. |
| `@staticcanvas/typeflow` | CommonJS | `dist/typeflow.cjs` | Node/CommonJS `require()` entrypoint. |
| `@staticcanvas/typeflow` | UMD | `dist/typeflow.js` | Universal browser script (`window.TypeFlow`). |
| `jsr:@staticcanvas/typeflow` | ESM | `src/typeflow.js` | JSR module for Deno/Node. |

## `TypeFlowConfig` Options

```typescript
export interface TypeFlowConfig {
  speed?: number;
  delay?: number;
  speedVariance?: number;
  naturalCadence?: boolean;
  granularity?: "grapheme" | "word";
  cursor?: string;
  cursorBlink?: boolean;
  html?: boolean;
  mode?: "replace" | "append";
  typeStyle?: "char" | "word" | "scramble";
  scrambleGlyphs?: string;
  scrambleRounds?: number;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  sanitizer?: (html: string) => string;
  respectReducedMotion?: boolean;
  ariaLive?: "off" | "polite" | "assertive";
  eraseStyle?: "end" | "start" | "scramble" | "instant" | "fade";
  duration?: number;
  preserveBaseline?: boolean;
  onStart?: () => void;
  onComplete?: (text: string) => void;
  onInterrupt?: () => void;
}
```

### Options Breakdown

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `speed` | `number` | `50` (type) / `25` (erase) | Milliseconds per character / word delay. |
| `delay` | `number` | `0` | Initial delay in ms before animation initiates. |
| `speedVariance` | `number` | `0` | Random jitter (+/- ms) added per unit for natural typing cadence. |
| `naturalCadence`| `boolean`| `false` | Adds natural micro-pauses at punctuation (. , ! ?) and word breaks. |
| `granularity` | `"grapheme" \| "word"` | `"grapheme"` | Unit segmentation mode using `Intl.Segmenter`. |
| `typeStyle` | `"char" \| "word" \| "scramble"` | `"char"` | Typing reveal presentation style. |
| `scrambleGlyphs`| `string` | `"!<>-_\\/[]{}—=+*^?#________"` | Character pool used during scramble reveals. |
| `scrambleRounds`| `number` | `2` | Number of glyph iterations per unit. |
| `cursor` | `string` | `"\|"` | Cursor glyph string. Set to `""` to omit cursor. |
| `cursorBlink` | `boolean` | `true` | Enables post-completion cursor blinking effect. |
| `html` | `boolean` | `false` | When `true`, parses input string as structured HTML markup. |
| `mode` | `"replace" \| "append"` | `"replace"` | `"replace"` clears element first; `"append"` preserves initial child nodes. |
| `allowedTags` | `string[]` | `['b', 'strong', 'i', 'em', 'mark', 'span', 'small', 'sub', 'sup', 'u', 'br', 'a', 'code']` | Allowed HTML tags for sanitization. |
| `allowedAttributes` | `Record<string, string[]>` | Defaults for `a`, `span`, `mark` | Map of tag names to allowed attribute arrays. |
| `sanitizer` | `(html: string) => string` | `undefined` | Custom HTML sanitization function. |
| `respectReducedMotion` | `boolean` | `true` | Skips animation if user OS has `prefers-reduced-motion: reduce`. |
| `ariaLive` | `"off" \| "polite" \| "assertive"` | `undefined` | Updates the element `aria-live` attribute during typing. |
| `eraseStyle` | `"end" \| "start" \| "scramble" \| "instant" \| "fade"` | `"end"` | Erasing animation method. |
| `duration` | `number` | `250` | Fade duration in ms when `eraseStyle: 'fade'`. |
| `preserveBaseline` | `boolean` | `true` | Retains initial prefix when erasing an `append` mode element. |
| `onStart` | `() => void` | `undefined` | Callback invoked right before the first character renders. |
| `onComplete` | `(text: string) => void` | `undefined` | Callback invoked upon animation completion. |
| `onInterrupt` | `() => void` | `undefined` | Callback invoked when `.stop()` is triggered early. |

---

## `TypeFlowController`

Returned by `TypeFlow.type()`, `TypeFlow.erase()`, `TypeFlow.sequence()`, and `TypeFlow.rotate()`.

| Property / Method | Type | Description |
| :--- | :--- | :--- |
| `stop()` | `() => void` | Cancels running timers and halts animation immediately. |
| `promise` | `Promise<TypeFlowResult>` | Resolves with `{ completed: boolean, text: string }`. Never rejects on interrupt. |

---

## Core Engine Methods

### `TypeFlow.type(target, text, config?)`
Types text or sanitized HTML into the element.

```javascript
const controller = TypeFlow.type('#msg', 'Hello <strong>World</strong>', { html: true });
```

### `TypeFlow.erase(target, config?)`
Erases text from the target using the specified `eraseStyle`.

```javascript
TypeFlow.erase('#msg', { eraseStyle: 'fade', duration: 300 });
```

### `TypeFlow.sequence(steps, seqConfig?)`
Orchestrates sequential typing, erasing, pausing, and arbitrary function callbacks.

```javascript
import { TypeFlow, seq } from '@staticcanvas/typeflow';

TypeFlow.sequence([
  seq.type('#output', 'Step 1 complete.'),
  seq.pause(500),
  seq.call(() => triggerSoundEffect()),
  seq.erase('#output'),
  seq.type('#output', 'Step 2 starting...')
], { repeat: 1 });
```

### `TypeFlow.rotate(target, words, config?)`
Cyclically types and erases an array of strings.

```javascript
TypeFlow.rotate('#rotating', ['Fast', 'Lightweight', 'Reliable'], {
  holdDuration: 1200,
  pauseBetween: 200,
  repeat: Infinity
});
```

### `TypeFlow.watch(container, selector, callback)`
Observes DOM subtree mutations and automatically invokes a callback whenever matching elements are injected.

```javascript
const watcher = TypeFlow.watch('#feed', '.item-title', (el) => {
  const text = el.textContent;
  el.textContent = '';
  TypeFlow.type(el, text, { speed: 20 });
});

// Later when destroying container:
watcher.disconnect();
```
