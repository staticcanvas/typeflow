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
---

## Erase Styles Overview

TypeFlow supports six distinct erase styles:

| Style | Description | Behavior |
| :--- | :--- | :--- |
| `end` (default) | Standard backspace erase | Removes characters from right to left. |
| `start` | Left erosion erase | Removes characters from left to right; tail stays in place. |
| `center` | Center-inward shrink | Shrinks content inward symmetrically toward the center. |
| `scramble` | Matrix decrypt erase | Jitters characters into randomized glyphs before clearing. |
| `fade` | CSS cross-fade | Fades element opacity smoothly before clearing content. |
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

## Baseline Preservation

When elements are typed using `mode: 'append'`, TypeFlow preserves the original baseline prefix and only erases the newly typed characters:

```javascript
TypeFlow.type('#terminal', 'User@host:~$ ', { mode: 'replace' });
TypeFlow.type('#terminal', 'npm run build', { mode: 'append' });

// Erasing will only remove "npm run build" — "User@host:~$ " remains intact!
TypeFlow.erase('#terminal', { preserveBaseline: true });
```
