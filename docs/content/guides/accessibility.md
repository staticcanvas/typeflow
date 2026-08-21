---
title: Accessibility
description: Guidelines for reduced motion support, ARIA live regions, and screen reader ergonomics.
eyebrow: Guides
---

## Reduced Motion Compliance

By default, TypeFlow checks the user's OS preference via `window.matchMedia('(prefers-reduced-motion: reduce)')`.

When reduced motion is active, animations complete immediately without flashing or rapid character intervals.

You can explicitly control this behavior:

```javascript
TypeFlow.type('#headline', 'Text content', {
  respectReducedMotion: true // default is true
});
```

## ARIA Live Regions

To prevent overwhelming screen readers with continuous micro-updates on every typed character, `ariaLive` is untouched by default.

When animating important status messages or announcements, specify the desired live region policy:

```javascript
TypeFlow.type('#status-bar', 'Build passed in 1.4s', {
  ariaLive: 'polite' // 'off' | 'polite' | 'assertive'
});
```
