---
title: Erase styles
description: Overview and configuration of TypeFlow multi-directional erase animation styles.
eyebrow: Guides
category: Guides
keywords:
  - erase
  - eraseStyle
  - backspace
  - start
  - center
  - scramble
  - fade
  - fade-trail
  - instant
  - decay
  - erosion
  - word-fade
  - float-in
  - zoom-in-space
  - word motion
---

## Erase Styles Overview

TypeFlow supports thirteen erase styles:

| Style | Description | Behavior |
| :--- | :--- | :--- |
| `end` (default) | Standard backspace erase | Removes characters from right to left. |
| `start` | Left erosion erase | Removes characters from left to right; tail stays in place. |
| `center` | Center-inward shrink | Shrinks content inward symmetrically toward the center. |
| `scramble` | Matrix decrypt erase | Jitters characters into randomized glyphs before clearing. |
| `fade-trail` | Trailing opacity erase | Applies an opacity ramp to the remaining character window. |
| `fade` | CSS cross-fade | Fades element opacity smoothly before clearing content. |
| `word-fade` | Stable-layout word fade | Fades words in document, reverse, or seeded-random order without moving the remaining words. |
| `float-in-top` | Spatial word motion | Words fade and slide in from/out toward the top. |
| `float-in-bottom` | Spatial word motion | Words fade and slide in from/out toward the bottom. |
| `float-in-left` | Spatial word motion | Words fade and slide in from/out toward the left. |
| `float-in-right` | Spatial word motion | Words fade and slide in from/out toward the right. |
| `zoom-in-space` | Perspective word motion | Words fade and scale in from/out toward depth using a CSS `perspective` transform. |
| `instant` | Immediate reset | Clears content instantly without animation. |

## Reveal Directions

Typing animations support three reveal directions via the `direction` option:

| Direction | Behavior | Description |
| :--- | :--- | :--- |
| `left` (default) | Left-to-right (LTR) | Standard typewriter flow starting from index 0. |
| `right` | Right-to-left (RTL) | Reverse reveal from end to start. |
| `center` | Center-outward | Expands outward symmetrically from the middle. |

## Examples

### Center-Inward Shrink (`center`)

```javascript
TypeFlow.erase('#headline', {
  eraseStyle: 'center',
  speed: 20
});
```

### Center-Outward Reveal (`direction: 'center'`)

```javascript
TypeFlow.type('#headline', 'EXPAND FROM CENTER', {
  direction: 'center',
  speed: 35
});
```

### Right-to-Left Backspace (`end`)

```javascript
TypeFlow.erase('#headline', {
  eraseStyle: 'end',
  speed: 20
});
```

### Scramble / Decrypt Erase (`scramble`)

```javascript
TypeFlow.erase('#headline', {
  eraseStyle: 'scramble',
  scrambleCharset: 'matrix',
  scrambleRounds: 2,
  speed: 25
});
```

### Left-to-Right Erosion (`start`)

```javascript
TypeFlow.erase('#headline', {
  eraseStyle: 'start',
  speed: 15
});
```

### Smooth Opacity Fade (`fade`)

```javascript
TypeFlow.erase('#headline', {
  eraseStyle: 'fade',
  duration: 350 // fade duration in ms
});
```

### Stable-Layout Word Fade (`word-fade`)

The complete line is laid out before the transition starts. Each word uses opacity, so its width and wrapping position remain unchanged while other words reveal or erase.

```javascript
TypeFlow.type('#headline', 'Every word keeps its final position.', {
  typeStyle: 'word-fade',
  wordOrder: 'left-to-right',
  wordFadeDuration: 280,
  wordStagger: 70
});
```

Reverse and deterministic random ordering use the same layout model:

```javascript
TypeFlow.erase('#headline', {
  eraseStyle: 'word-fade',
  wordOrder: 'random',
  wordSeed: 'documentation-example',
  wordFadeDuration: 220,
  wordStagger: 55
});
```

Use `wordLayout: 'placeholder'` when unrevealed words must also be hidden with `visibility`. Both modes retain the original word text for sizing; TypeFlow does not replace proportional text with repeated space characters.

### Spatial Word-Motion Reveal & Erase (`float-in-*`, `zoom-in-space`)

`float-in-top`, `float-in-bottom`, `float-in-left`, `float-in-right`, and `zoom-in-space` share the same stable-layout word engine as `word-fade`: the full text is laid out once, then each word transitions from a hidden transform/opacity state to its final position. They accept the same `wordOrder`, `wordLayout`, `wordFadeDuration`, `wordStagger`, and `wordSeed` options as `word-fade`, plus four motion-only options shared across every spatial style:

| Option | Applies to | Default | Description |
| :--- | :--- | :--- | :--- |
| `wordMotionDistance` | `float-in-*` | `24` | Translate distance in pixels. |
| `wordMotionDepth` | `zoom-in-space` | `160` | `translateZ` depth in pixels. |
| `wordMotionScale` | `zoom-in-space` | `0.82` | Starting scale (0-1) before words zoom to full size. |
| `wordMotionPerspective` | `zoom-in-space` | `600` | CSS `perspective` in pixels applied to the target element for the animation's duration. |
| `wordMotionEasing` | all spatial styles | `'ease'` | CSS timing function for the opacity/transform transition. |

```javascript
TypeFlow.type('#headline', 'Words arrive from above.', {
  typeStyle: 'float-in-top',
  wordMotionDistance: 32,
  wordFadeDuration: 260,
  wordStagger: 60,
});

TypeFlow.erase('#headline', {
  eraseStyle: 'zoom-in-space',
  wordMotionDepth: 200,
  wordMotionScale: 0.7,
  wordMotionPerspective: 700,
  wordMotionEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
});
```

Behavior notes:
- **Granularity**: these styles operate on whole words (like `word-fade`); the `granularity` option is not consulted for them.
- **Safe HTML**: nested inline tags (`<strong>`, `<a>`, etc.) are preserved — only text-node words are wrapped for animation, element boundaries are cloned as-is.
- **Bidirectional text**: `wordOrder` reorders the *sequence* words animate in; it never changes the document's `dir`/bidi rendering, so right-to-left scripts keep their native visual order at every step.
- **Transform requirement**: because CSS transforms have no effect on `display: inline` boxes, each word wrapper is promoted to `inline-block` only while a spatial style is active, and the wrapper (along with any `perspective`/`transform-style` set on the target) is fully removed once the animation completes or is interrupted, leaving the original DOM content behind.
- **Reduced motion**: with the default `respectReducedMotion: true`, a `prefers-reduced-motion: reduce` user renders the final text/erased state instantly, with no transform or opacity animation.

## Baseline Preservation

When elements are typed using `mode: 'append'`, TypeFlow preserves the original baseline prefix and only erases the newly typed characters:

```javascript
TypeFlow.type('#terminal', 'User@host:~$ ', { mode: 'replace' });
TypeFlow.type('#terminal', 'npm run build', { mode: 'append' });

// Erasing will only remove "npm run build" — "User@host:~$ " remains intact!
TypeFlow.erase('#terminal', { preserveBaseline: true });
```
