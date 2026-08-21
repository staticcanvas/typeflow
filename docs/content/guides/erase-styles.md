---
title: Erase styles
description: Overview and configuration of TypeFlow multi-directional erase animation styles.
eyebrow: Guides
---

## Erase Styles Overview

TypeFlow supports four distinct erase styles:

| Style | Description | Behavior |
| :--- | :--- | :--- |
| `end` (default) | Standard backspace erase | Removes characters from right to left. |
| `start` | Left erosion erase | Removes characters from left to right; tail stays in place. |
| `fade` | CSS cross-fade | Fades element opacity smoothly before clearing content. |
| `instant` | Immediate reset | Clears content instantly without animation. |

## Examples

### Right-to-Left Backspace (`end`)

```javascript
TypeFlow.erase('#headline', {
  eraseStyle: 'end',
  speed: 20
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
