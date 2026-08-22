# Changelog

All notable changes to the TypeFlow project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **Framework Integrations**:
  - Runtime adapter factories for React, Vue 3, Svelte actions, Solid.js signals, and Alpine.js directives.
  - Native `<type-flow>` Web Component support for declarative use across browser applications and framework templates.
  - Documented Astro client-island integration through the browser-native ESM API; Astro does not require a separate runtime adapter.
- **Documentation**:
  - Expanded the README and framework guide with all shipped adapters, Astro integration, Web Components, and the Angular directive recipe.
- **Core Engine Architecture**:
  - Pure ECMAScript zero-dependency typewriter animation engine with frame-accurate timing (<7.2 KB gzipped).
  - Trailing Fade Reveal & Erase (`typeStyle: 'fade-trail'`, `eraseStyle: 'fade-trail'`, `trailFade: number`) rendering soft glowing opacity ramps along the typing edge.
  - Multi-target Stagger Engine (`TypeFlow.stagger(targets, texts, options)`) coordinating simultaneous staggered typing across multiple DOM elements.
  - Multi-directional text reveal engine supporting `direction: 'left'` (LTR), `direction: 'right'` (RTL/reverse), and `direction: 'center'` (middle-outward expansion).
  - Multi-directional erase engine supporting `eraseStyle: 'end'` (backspace), `eraseStyle: 'start'` (left erosion), `eraseStyle: 'center'` (shrink inward to center), `eraseStyle: 'scramble'`, `eraseStyle: 'fade'`, `eraseStyle: 'fade-trail'`, and `eraseStyle: 'instant'`.
  - Built-in scramble charset presets (`matrix`, `ascii`, `ascii-extended`, `blocks`, `binary`, `hex`, `braille`, `runic`, `cyber`) and custom glyph pool overrides.
  - Procedural Web Audio API micro-synthesizer (`audio: 'mechanical' | 'beep' | 'synth' | fn`) generating zero-asset audio clicks and pings.
  - Smart Morph Diff Typing (`TypeFlow.morph(target, nextText, options)`) computing longest common prefix and erasing only mismatched suffixes.
  - Real-time Stream Ingestion Controller (`TypeFlow.stream(target, options)`) with non-blocking FIFO chunk queue for LLM token ingestion.
  - Built-in animation preset profiles (`TypeFlow.preset(name, overrides)`) for `cyberpunk`, `terminal`, `writer`, `matrix`, `blocks`, and `subtle`.
  - `Intl.Segmenter` integration for grapheme cluster and atomic word segmentation across international scripts and compound emojis.
  - Natural cadence punctuation pauses (`naturalCadence: true`) adding micro-pauses at punctuation marks (`.`, `,`, `!`, `?`, `;`, `:`).
  - Layout shift prevention helper (`TypeFlow.fit(target, candidates)`) to lock container bounds and eliminate Cumulative Layout Shift (CLS).
- **Companion Modular Extensions (`src/`)**:
  - `typeflow-metrics.js` (`@staticcanvas/typeflow/metrics`): Real-time floating HUD diagnostic metrics badge (FPS, active animations, typed/erased units, render latency, DOM mutations, memory heap, and JSON export).
  - `typeflow-debug.js` (`@staticcanvas/typeflow/debug`): Telemetry tracing with `@staticcanvas/logcad` integration, structured colored console logging, and execution timeline history.
  - `typeflow-webaudio.js` (`@staticcanvas/typeflow/webaudio`): Procedural Web Audio synthesis engine with 8 switch sound profiles (Blue, Red, Brown, Beamspring, Teletype, Cyber Synth, 8-bit, Bubble Pop) and stereo panning.
  - `typeflow-keystroke.js` (`@staticcanvas/typeflow/keystroke`): Human typing dynamics modeling QWERTY key Euclidean distance, thought pauses, fatigue deceleration, and realistic typo injection with backspace auto-correction.
  - `typeflow-extchars.js` (`@staticcanvas/typeflow/extchars`): Extended Unicode glyph presets (Hieroglyphs, Runic, Ogham, Coptic, Katakana, Box-Drawing, Braille, Astronomy, Glitch).
- **HTML Parsing & Sanitization**:
  - Safe HTML typing mode (`html: true`) with automated tag balancing and strict tag/attribute allowlist sanitization against XSS.
  - Void element preservation (`<br>`, `<hr>`, `<img>`, `<wbr>`) across animation frames.
- **Sequence & Orchestration**:
  - Step-based sequence engine (`TypeFlow.sequence()`) with `seq.type()`, `seq.erase()`, `seq.pause()`, `seq.call()`, and `seq.visible()`.
  - Viewport intersection observer step (`seq.visible()`) for scroll-triggered animation start.
  - Rotating text pattern helper (`TypeFlow.rotate()`) with configurable hold and pause durations.
  - DOM mutation observer (`TypeFlow.watch()`) for automatic animation of dynamically injected elements.
- **Framework Adapters**:
  - Framework integration factory helpers for React (`createTypeFlowReact`), Vue (`createTypeFlowVue`), Svelte (`createTypeFlowSvelte`), and Solid.js (`createTypeFlowSolid`).
- **Accessibility & Compliance**:
  - Built-in `prefers-reduced-motion` detection and instant settlement fallback.
  - Configurable `aria-live` region management (`polite` / `assertive`).
  - Zero-layout-shift blinking cursor (`.tf-cursor`) using CSS visibility toggling.
- **Documentation, CLI & Benchmarks**:
  - Hugo documentation site with interactive playground, documentation guides, and package downloads.
  - Automated 10,000+ character performance and memory benchmark suite with CLI Markdown output (`npm run benchmark:md`).
  - Strict bundle size budget verification (`npm run check:size`).
  - Full JSDoc annotations across all classes and functions adhering to the company standard (`@description`, `@param`, `@returns`, `@Properties`, `@example`).
  - Comprehensive Vitest and JSDOM test suite (44/44 tests passing) covering all options, directions, charsets, morphing, streaming, presets, and companion extensions.
