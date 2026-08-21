---
title: Changelog
description: Release history and version notes for TypeFlow.
eyebrow: Releases
---

## v2.3.0 (Latest)

- Added native `Intl.Segmenter` grapheme and word segmentation for international character clusters and compound emojis.
- Added `typeStyle: 'scramble'` and `eraseStyle: 'scramble'` matrix decryption animation modes.
- Added `granularity: 'word'` and `typeStyle: 'word'` atomic word stream reveals.
- Added `naturalCadence: true` for punctuation-aware typing pauses (`.`, `,`, `!`, `?`).
- Added `seq.visible()` IntersectionObserver sequence step trigger.
- Added Svelte action (`createTypeFlowSvelte`) and Solid.js adapter (`createTypeFlowSolid`).
- Added comprehensive Vitest + JSDOM test suite with 10k character performance benchmarks.

## v2.2.0

- Added multi-directional erase styles: `start` (left erosion), `fade` (CSS opacity fade), `end` (backspace), and `instant`.
- Added sequence target fallbacks and step-level target resolution.
- Added `TypeFlow.rotate()` pattern helper.
- Added `TypeFlow.watch()` DOM mutation listener utility.

## v2.1.0

- Introduced `TypeFlow.sequence()` with `type`, `erase`, `pause`, and `call` step orchestration.
- Added support for `speedVariance` per-character jitter.

## v2.0.0

- Complete modern ESM rewrite.
- Added allowlist HTML sanitization with safe tag balancing.
- Added `prefers-reduced-motion` compliance.
- Added React and Vue adapter factories.
