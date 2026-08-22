---
title: API reference
description: Full specification of options, controllers, methods, and companion extensions in TypeFlow.
eyebrow: Specifications
category: Reference
keywords:
  - api
  - config
  - options
  - TypeFlowConfig
  - TypeFlowController
  - type
  - erase
  - morph
  - stream
  - stagger
  - preset
  - fit
  - sequence
  - rotate
  - watch
  - stop
  - isTyping
  - metrics
  - debug
  - webaudio
  - keystroke
  - extchars
  - typescript
---

## Package Exports

The `@staticcanvas/typeflow` package provides ESM, CommonJS, and UMD distributions.

| Export Path | Format | Target | Description |
| :--- | :--- | :--- | :--- |
| `@staticcanvas/typeflow` | ESM / CJS / UMD | `dist/typeflow.mjs` | Core typewriter engine and sequence helpers. |
| `@staticcanvas/typeflow/metrics` | ESM | `src/typeflow-metrics.js` | Real-time floating performance HUD and diagnostic badge. |
| `@staticcanvas/typeflow/debug` | ESM | `src/typeflow-debug.js` | Diagnostic tracing and `@staticcanvas/logcad` integration. |
| `@staticcanvas/typeflow/webaudio` | ESM | `src/typeflow-webaudio.js` | Zero-asset procedural Web Audio synthesizer. |
| `@staticcanvas/typeflow/keystroke` | ESM | `src/typeflow-keystroke.js` | Human typing dynamics, finger travel, and typo simulation. |
| `@staticcanvas/typeflow/extchars` | ESM | `src/typeflow-extchars.js` | Extended Unicode glyph sets for decrypt scramble reveals. |
| `jsr:@staticcanvas/typeflow` | ESM | `src/typeflow.js` | JSR package distribution for Deno and Node. |

## `TypeFlowConfig` Options

```typescript
export interface TypeFlowConfig {
  speed?: number;
  delay?: number;
  speedVariance?: number;
  naturalCadence?: boolean;
  granularity?: "grapheme" | "word";
  direction?: "left" | "right" | "center";
  typeStyle?: "char" | "word" | "scramble" | "fade-trail";
  trailFade?: number | boolean;
  cursor?: string;
  cursorBlink?: boolean;
  html?: boolean;
  mode?: "replace" | "append";
  scrambleCharset?: "matrix" | "ascii" | "ascii-extended" | "blocks" | "binary" | "hex" | "braille" | "runic" | "cyber";
  scrambleGlyphs?: string;
  scrambleRounds?: number;
  audio?: "mechanical" | "beep" | "synth" | boolean | (() => void);
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  sanitizer?: (html: string) => string;
  respectReducedMotion?: boolean;
  ariaLive?: "off" | "polite" | "assertive";
  eraseStyle?: "end" | "start" | "center" | "scramble" | "fade-trail" | "instant" | "fade";
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
| `direction` | `"left" \| "right" \| "center"` | `"left"` | Typing reveal direction (LTR, RTL, center-outward). |
| `typeStyle` | `"char" \| "word" \| "scramble" \| "fade-trail"` | `"char"` | Typing reveal presentation style (`fade-trail` adds a soft trailing opacity gradient). |
| `trailFade` | `number \| boolean` | `undefined` | Length of trailing fade gradient in characters. |
| `scrambleCharset` | `"matrix" \| "ascii" \| ...` | `undefined` | Built-in scramble glyph charset preset name. |
| `scrambleGlyphs`| `string` | `"!<>-_\\/[]{}—=+*^?#________"` | Character pool used during scramble reveals. |
| `scrambleRounds`| `number` | `2` | Number of glyph iterations per unit. |
| `audio` | `"mechanical" \| "beep" \| "synth" \| boolean \| fn` | `undefined` | Procedural Web Audio synthesized keystrokes or custom sound callback. |
| `cursor` | `string` | `"\|"` | Cursor glyph string. Set to `""` to omit cursor. |
| `cursorBlink` | `boolean` | `true` | Enables post-completion cursor blinking effect. |
| `html` | `boolean` | `false` | When `true`, parses input string as structured HTML markup. |
| `mode` | `"replace" \| "append"` | `"replace"` | `"replace"` clears element first; `"append"` preserves initial child nodes. |
| `allowedTags` | `string[]` | `['b', 'strong', 'i', 'em', 'mark', 'span', 'small', 'sub', 'sup', 'u', 'br', 'a', 'code']` | Allowed HTML tags for sanitization. |
| `allowedAttributes` | `Record<string, string[]>` | Defaults for `a`, `span`, `mark` | Map of tag names to allowed attribute arrays. |
| `sanitizer` | `(html: string) => string` | `undefined` | Custom HTML sanitization function. |
| `respectReducedMotion` | `boolean` | `true` | Skips animation if user OS has `prefers-reduced-motion: reduce`. |
| `ariaLive` | `"off" \| "polite" \| "assertive"` | `undefined` | Updates the element `aria-live` attribute during typing. |
| `eraseStyle` | `"end" \| "start" \| "center" \| "scramble" \| "fade-trail" \| "instant" \| "fade"` | `"end"` | Erasing animation method. |
| `duration` | `number` | `250` | Fade duration in ms when `eraseStyle: 'fade'`. |
| `preserveBaseline` | `boolean` | `true` | Retains initial prefix when erasing an `append` mode element. |
| `onStart` | `() => void` | `undefined` | Callback invoked right before the first character renders. |
| `onComplete` | `(text: string) => void` | `undefined` | Callback invoked upon animation completion. |
| `onInterrupt` | `() => void` | `undefined` | Callback invoked when `.stop()` is triggered early. |

---

## `TypeFlowController`

Returned by `TypeFlow.type()`, `TypeFlow.erase()`, `TypeFlow.morph()`, `TypeFlow.stagger()`, `TypeFlow.sequence()`, and `TypeFlow.rotate()`.

| Property / Method | Type | Description |
| :--- | :--- | :--- |
| `stop()` | `() => void` | Cancels running timers and halts animation immediately without promise rejection. |
| `promise` | `Promise<TypeFlowResult>` | Resolves with `{ completed: boolean, text: string }`. |

---

## Core Engine Methods

### `TypeFlow.type(target, text, config?)`
Types text or sanitized HTML into the element.

```javascript
const controller = TypeFlow.type('#msg', 'Hello <strong>World</strong>', {
  html: true,
  direction: 'center',
  audio: 'mechanical'
});
```

### `TypeFlow.erase(target, config?)`
Erases text from the target using the specified `eraseStyle`.

```javascript
TypeFlow.erase('#msg', { eraseStyle: 'fade-trail', speed: 20 });
```

### `TypeFlow.morph(target, nextText, config?)`
Computes the longest common prefix between existing text and `nextText`, erases only the changed suffix, and types the new text.

```javascript
await TypeFlow.type('#status', 'Connection: Pending');
await TypeFlow.morph('#status', 'Connection: Established');
```

### `TypeFlow.stream(target, config?)`
Creates a streaming chunk consumer for real-time LLM token ingestion.

```javascript
const stream = TypeFlow.stream('#output', { speed: 15 });
stream.push('Processing ');
stream.push('query results...');
```

### `TypeFlow.stagger(targets, texts?, config?)`
Staggers typing across multiple DOM elements simultaneously with offset delays.

```javascript
TypeFlow.stagger('.terminal-line', [
  'npm install @staticcanvas/typeflow',
  'npm run build',
  'Ready.'
], { stagger: 200, speed: 25 });
```

### `TypeFlow.preset(name, overrides?)`
Returns a pre-configured options object for common styles (`'cyberpunk'`, `'terminal'`, `'writer'`, `'matrix'`, `'blocks'`, `'subtle'`).

```javascript
TypeFlow.type('#terminal', 'INITIALIZING MATRIX', TypeFlow.preset('cyberpunk'));
```

### `TypeFlow.fit(target, candidates)`
Measures candidate phrases and locks the container's inline dimensions to eliminate Cumulative Layout Shift (CLS).

```javascript
TypeFlow.fit('#rotating', ['Short', 'A much longer rotating phrase']);
```

### `TypeFlow.sequence(steps, seqConfig?)`
Orchestrates sequential typing, erasing, pausing, and arbitrary function callbacks.

```javascript
import { TypeFlow, seq } from '@staticcanvas/typeflow';

TypeFlow.sequence([
  seq.visible('#output'),
  seq.type('#output', 'Step 1 complete.'),
  seq.pause(500),
  seq.call(() => console.log('Milestone')),
  seq.erase('#output', { eraseStyle: 'center' }),
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

// Clean up
watcher.disconnect();
```

---

## Companion Extensions API

### `TypeFlowMetrics` (`@staticcanvas/typeflow/metrics`)
```javascript
import { TypeFlowMetrics } from '@staticcanvas/typeflow/metrics';

TypeFlowMetrics.mount({ position: 'bottom-right', detailed: false });
const stats = TypeFlowMetrics.getStats();
TypeFlowMetrics.unmount();
```

### `TypeFlowDebug` (`@staticcanvas/typeflow/debug`)
```javascript
import { TypeFlowDebug } from '@staticcanvas/typeflow/debug';

TypeFlowDebug.enable({ logcad: true, console: true });
TypeFlowDebug.trace(controller, 'Target Label');
const jsonLog = TypeFlowDebug.exportLog();
```

### `TypeFlowWebAudio` (`@staticcanvas/typeflow/webaudio`)
```javascript
import { TypeFlowWebAudio, createKeystrokeAudio } from '@staticcanvas/typeflow/webaudio';

TypeFlowWebAudio.play('mechanical-blue', { pan: 0.1 });
const audioCallback = createKeystrokeAudio('teletype');
```

### `TypeFlowKeystroke` (`@staticcanvas/typeflow/keystroke`)
```javascript
import { TypeFlowKeystroke, calculateKeyDistance } from '@staticcanvas/typeflow/keystroke';

const dist = calculateKeyDistance('q', 'p');
const actions = TypeFlowKeystroke.humanize('Typo injection text', { errorRate: 0.05 });
```

### `TypeFlowExtChars` (`@staticcanvas/typeflow/extchars`)
```javascript
import { TypeFlowExtChars, getExtendedCharset } from '@staticcanvas/typeflow/extchars';

const runes = getExtendedCharset('runic');
const custom = TypeFlowExtChars.combineCharsets('hieroglyphs', 'coptic');
```
