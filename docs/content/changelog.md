---
title: Changelog
description: Release history and version notes for TypeFlow.
eyebrow: Releases
---

## v2.2.0 (Latest)

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
