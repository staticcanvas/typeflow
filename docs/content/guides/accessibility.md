---
title: Accessibility
description: Guidelines for reduced motion support, ARIA live regions, and screen reader ergonomics.
eyebrow: Guides
---

## Reduced Motion Compliance

TypeFlow checks `window.matchMedia('(prefers-reduced-motion: reduce)')`. When active, animations complete immediately.

Control this behavior explicitly:

```javascript
TypeFlow.type('#headline', 'Text content', {
  respectReducedMotion: true // default is true
});
```

## ARIA Live Regions

`ariaLive` is untouched by default to prevent screen reader noise.

Specify the desired live region policy for important announcements:

```javascript
TypeFlow.type('#status-bar', 'Build passed in 1.4s', {
  ariaLive: 'polite' // 'off' | 'polite' | 'assertive'
});
```
