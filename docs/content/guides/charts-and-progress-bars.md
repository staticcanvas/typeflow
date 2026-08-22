---
title: Text charts, sparklines & progress bars
description: Utilizing TypeFlow for animated Unicode progress meters, multi-segment pipelines, real-time sparkline telemetry, and morphing dashboard widgets.
eyebrow: Guides
category: Guides
keywords:
  - charts
  - sparklines
  - progress bars
  - unicode
  - telemetry
  - morph
  - stream
  - ascii
  - dashboards
---

## Text-Based Telemetry & Progress Meters

Because TypeFlow processes strings through `Intl.Segmenter` grapheme cluster slicing, non-destructive AST intervals, and smart suffix diff morphing, the engine is uniquely equipped to animate text-based progress bars, live sparkline gauges, and CLI/TUI dashboard telemetry widgets without canvas or SVG overhead.

---

## 1. Unicode Progress Bars

Progress bars rendered in standard block characters (`█`, `▉`, `▊`, `▋`, `▌`, `▍`, `▎`, `▏`, `░`) can be revealed smoothly using character or word granularity.

### Block Progress Meter Example

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';

const meterElement = document.getElementById('build-meter');

// Revealing progress meter
TypeFlow.type(
  meterElement,
  'Asset Optimization [████████████████████░░░░░░░░░░] 67% (42/63 MB)',
  {
    speed: 15,
    cursor: '▍',
    direction: 'left',
  }
);
```

### Dynamic Progress Morphing

When tracking real-time percentage jumps (e.g. `20%` $\to$ `45%` $\to$ `80%` $\to$ `100%`), `TypeFlow.morph()` computes the Longest Common Prefix (LCP) and only repaints the updated blocks and percentage digits:

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';

const target = document.querySelector('#deploy-progress');

// Step 1: Initialize baseline
await TypeFlow.type(target, 'Deployment [████░░░░░░░░░░░░░░░░] 20%', { speed: 20 }).promise;

// Step 2: Morph to 60%
await TypeFlow.morph(target, 'Deployment [████████████░░░░░░░░] 60%', { speed: 25 }).promise;

// Step 3: Morph to 100% Complete
await TypeFlow.morph(target, 'Deployment [████████████████████] 100% (Complete)', { speed: 20 }).promise;
```

---

## 2. Multi-Stage Pipeline Steppers

Using `TypeFlow.sequence()` or framework sequence hooks, multi-phase CI/CD or installer pipelines can be animated deterministically:

```javascript
import { TypeFlow, seq } from '@staticcanvas/typeflow';

TypeFlow.sequence([
  seq.type('#pipeline', '[✓ Linting: Clean]'),
  seq.pause(300),
  seq.type('#pipeline', ' ➔ [⚡ Compiling Bundles (ESM/CJS)]', { mode: 'append' }),
  seq.pause(400),
  seq.type('#pipeline', ' ➔ [▶ Testing: 48/48 Passed]', { mode: 'append' }),
  seq.pause(300),
  seq.type('#pipeline', ' ➔ [🚀 Published to npm/JSR]', { mode: 'append' }),
]);
```

---

## 3. Real-Time Sparkline Telemetry

Sparklines utilize Unicode vertical block elements (` `, `▂`, `▃`, `▄`, `▅`, `▆`, `▇`, `█`) to visualize CPU utilization, memory pressure, or network bandwidth trends:

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';

function generateSparkline(values, min = 0, max = 100) {
  const glyphs = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  return values
    .map((v) => {
      const idx = Math.min(glyphs.length - 1, Math.max(0, Math.floor(((v - min) / (max - min)) * glyphs.length)));
      return glyphs[idx];
    })
    .join('');
}

const cpuHistory = [12, 24, 45, 60, 52, 78, 92, 85, 94];
const chart = `CPU Core 0: ${generateSparkline(cpuHistory)} 94.2% | Heap: [████████░░] 78%`;

TypeFlow.type('#system-hud', chart, {
  speed: 25,
  cursor: '|',
  cursorBlink: true,
});
```

---

## 4. Braille Matrix & Hex Meters

For cybernetic, high-tech, or status monitor interfaces, TypeFlow's `scramble` engine with `braille` or `hex` charsets creates high-density matrix decrypt transitions:

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';

TypeFlow.type(
  '#crypto-meter',
  'Entropy Buffer: ⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ [⡿⣿⢿⣻⣽⣾] Integrity: 99.98%',
  {
    typeStyle: 'scramble',
    scrambleCharset: 'braille',
    scrambleRounds: 3,
    speed: 30,
  }
);
```

---

## 5. Performance & Layout Safety

| Requirement | Implementation Detail | Guarantee |
| :--- | :--- | :--- |
| **Zero CLS** | Fixed character cell count and monospaced font stacks (`JetBrains Mono`, `Cascadia Code`). | Cumulative Layout Shift $= 0.00$. |
| **Non-blocking UI** | Sliced DOM interval updates avoid full inner HTML repainting. | 60 FPS animation loop without frame drops. |
| **Screen Reader Off** | `aria-live="off"` default prevents noisy screen reader spam during continuous meter updates. | WCAG 2.2 AA compliant. |
