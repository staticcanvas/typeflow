---
title: Companion Extensions
description: Modular opt-in extensions for performance telemetry, Web Audio, keystroke dynamics, debugging, and extended Unicode charsets.
eyebrow: Extensions
category: Extensions
keywords:
  - extensions
  - metrics
  - hud
  - debug
  - logcad
  - webaudio
  - keystroke
  - extchars
  - glyphs
  - hieroglyphs
  - runic
  - ogham
  - coptic
  - katakana
  - sound
  - typos
weight: 6
---

TypeFlow is built with a hyper-optimized core engine (<7.2 KB gzipped). For developers requiring advanced capabilities, TypeFlow provides five modular, tree-shakeable companion extensions.

```mermaid
graph LR
    A[Core Engine: @staticcanvas/typeflow] --> B[@staticcanvas/typeflow/metrics]
    A --> C[@staticcanvas/typeflow/debug]
    A --> D[@staticcanvas/typeflow/webaudio]
    A --> E[@staticcanvas/typeflow/keystroke]
    A --> F[@staticcanvas/typeflow/extchars]
```

---

## 1. Performance Metrics HUD (`@staticcanvas/typeflow/metrics`)

The `TypeFlowMetrics` extension mounts an accessible, zero-CLS floating diagnostic HUD badge in the viewport.

### Installation & Usage

```javascript
import { TypeFlowMetrics } from '@staticcanvas/typeflow/metrics';

// Mount floating badge in the bottom-right corner
const hud = TypeFlowMetrics.mount({
  position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  detailed: false,          // Starts in compact mode; click to expand diagnostic cards
  updateInterval: 250,      // Polling frequency in ms
});

// Programmatic stats access
const stats = TypeFlowMetrics.getStats();
console.log('Active animations:', stats.activeInstances);
console.log('Lifetime characters typed:', stats.totalTyped);
```

### Metrics Tracked
- **Frame Rate (FPS)**: Real-time rendering frequency.
- **Active Animations**: Currently running TypeFlow controllers.
- **Lifetime Units**: Total typed and erased units.
- **DOM Mutations**: Count of DOM child / character modifications.
- **Heap Memory**: Current JS Heap memory (in supported browsers).
- **JSON Export**: One-click copy of telemetry data for bug reports.

---

## 2. Telemetry & LogCAD Debugging (`@staticcanvas/typeflow/debug`)

The `TypeFlowDebug` extension connects TypeFlow's animation lifecycle to `@staticcanvas/logcad` or styled console groups.

```javascript
import { TypeFlowDebug } from '@staticcanvas/typeflow/debug';
import { TypeFlow } from '@staticcanvas/typeflow';

// Enable debugging
TypeFlowDebug.enable({
  logcad: true,    // Route through @staticcanvas/logcad if available
  console: true,   // Output styled color-coded console logs
  maxHistory: 200, // Retain last 200 events in memory
});

// Trace a controller
const ctrl = TypeFlow.type('#headline', 'Diagnostics enabled');
TypeFlowDebug.trace(ctrl, 'Hero Headline');
```

---

## 3. Procedural Web Audio (`@staticcanvas/typeflow/webaudio`)

Synthesizes high-fidelity, zero-asset mechanical switch clicks, vintage teletype strikes, and cyber synths in real time using the native Web Audio API.

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';
import { TypeFlowWebAudio, createKeystrokeAudio } from '@staticcanvas/typeflow/webaudio';

// Attach directly to TypeFlow's audio option
TypeFlow.type('#terminal', 'Connecting to mainframe...', {
  audio: createKeystrokeAudio('mechanical-blue', {
    pan: 0.2,            // Stereo pan (-1.0 to 1.0)
    pitchVariance: 0.06, // Natural ±6% frequency jitter
  }),
  speed: 35,
});
```

### Supported Sound Profiles
- `'mechanical-blue'` / `'clicky'`: Crisp high-transient click with body thud.
- `'mechanical-brown'` / `'tactile'`: Damped tactile bump.
- `'mechanical-red'`: Smooth linear bottom-out.
- `'teletype'` / `'vintage'`: Electro-mechanical strike + carriage return bell on `\n`.
- `'cyber-synth'` / `'synth'`: FM neon laser chirp.
- `'terminal-8bit'` / `'beep'`: Retro square-wave pulse.
- `'bubble'` / `'pop'`: Acoustic liquid pop.

---

## 4. Humanized Keystroke Dynamics (`@staticcanvas/typeflow/keystroke`)

Simulates realistic human typing by modeling physical QWERTY finger travel distance, clause thought pauses, fatigue deceleration, and realistic typo injection with auto-correction backspaces.

```javascript
import { TypeFlowKeystroke, calculateKeyDistance } from '@staticcanvas/typeflow/keystroke';

// Calculate physical keyboard distance between keys
const dist = calculateKeyDistance('q', 'p'); // ~9.0 key units

// Compute dynamic delay for natural rhythm
const delay = TypeFlowKeystroke.getDelay('a', 'b', { baseSpeed: 40 });

// Injects realistic adjacent-key typos and automatic backspaces
const actions = TypeFlowKeystroke.humanize('Fast, resilient, zero dependencies.', {
  errorRate: 0.04,   // 4% typo probability per character
  hesitationMs: 180, // Pause before realizing mistake
});
```

---

## 5. Extended Unicode Charsets (`@staticcanvas/typeflow/extchars`)

Extends TypeFlow's scramble reveals with hundreds of specialized glyphs across ancient scripts, mathematics, and cyber glitch presets.

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';
import { TypeFlowExtChars, getExtendedCharset } from '@staticcanvas/typeflow/extchars';

// Ancient Egyptian Hieroglyphic reveal
TypeFlow.type('#sacred-text', 'TEMPLE OF KARNAK', {
  typeStyle: 'scramble',
  scrambleGlyphs: getExtendedCharset('hieroglyphs'),
  scrambleRounds: 3,
});

// Combine multiple custom pools
const customPool = TypeFlowExtChars.combineCharsets('runic', 'katakana', 'mathSymbols');
```

### Available Extended Presets
- `hieroglyphs`: Egyptian hieroglyphic symbols (`𓀀𓀁𓀂𓀃...`).
- `runic`: Elder & Anglo-Saxon runes (`ᚠᚡᚢᚣᚤ...`).
- `ogham`: Celtic Ogham script (`ᚁᚂᚃᚄᚅ...`).
- `coptic`: Coptic alphabet (`ⲀⲂⲄⲆⲈ...`).
- `katakana`: Cyber Katakana glyphs (`ｱｲｳｴｵ...`).
- `boxDrawing`: Terminal borders & frames (`┌┐└┘├┤┬┴┼...`).
- `mathSymbols`: Calculus & set theory operators (`∀∂∃∅∆∇∈∉...`).
- `braille`: Full Braille patterns (`⠁⠂⠃⠄...`).
- `astronomical`: Planetary & zodiac glyphs (`☉☽☿♀♁♂...`).
- `glitch`: Combining zalgo diacritics.
