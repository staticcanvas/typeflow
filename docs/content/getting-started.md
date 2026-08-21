---
title: Get started
description: Install TypeFlow and create your first typewriter animation in vanilla JS or modern frameworks.
eyebrow: Quick start
---

## Installation

Install `@staticcanvas/typeflow` version `{{< package-version >}}` from npm, jsr, or load it directly from modern CDNs.

{{< code-tabs >}}

## Basic Usage

Import the singleton `TypeFlow` instance and call `type()` on any DOM element or query selector string:

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';

// Animate a simple heading
const controller = TypeFlow.type('#headline', 'Building refined web experiences.', {
  speed: 45,
  cursor: '|',
  cursorBlink: true,
  onComplete: (text) => console.log('Animation completed:', text)
});
```

## Erasing Content

TypeFlow provides fine-grained erase control with multiple erase styles:

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';

// Erase from the right (backspace style)
TypeFlow.erase('#headline', {
  speed: 20,
  eraseStyle: 'end'
});

// Left-erosion erase style (start)
TypeFlow.erase('#headline', {
  speed: 15,
  eraseStyle: 'start'
});
```

## Stopping Animations

All `type()`, `erase()`, `sequence()`, and `rotate()` methods return a `TypeFlowController` object:

```javascript
const controller = TypeFlow.type('#status', 'Fetching system metrics...');

// Abort typing at any time
button.addEventListener('click', () => {
  controller.stop();
});

// The controller promise always resolves safely without rejecting
controller.promise.then(({ completed, text }) => {
  if (!completed) {
    console.log('Interrupted early. Rendered text:', text);
  }
});
```

## What's Next?

- Explore [Sequences & Rotators]({{< relref "/guides/sequences" >}}) to build multi-step conversational UI flows.
- Review [HTML & Sanitization]({{< relref "/guides/html-sanitization" >}}) for rich formatted typography.
- Test options dynamically in the [Interactive Playground]({{< relref "/playground" >}}).
