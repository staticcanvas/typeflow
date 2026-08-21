---
title: Sequences
description: Construct multi-step animations, dialogues, and coordinated DOM sequences with TypeFlow.
eyebrow: Guides
---

## Sequence Orchestration

`TypeFlow.sequence()` allows you to chain multiple animation steps cleanly without nesting asynchronous promises or callback pyramids.

```javascript
import { TypeFlow, seq } from '@staticcanvas/typeflow';

const sequenceController = TypeFlow.sequence([
  seq.type('#speaker', 'Agent: System scan initiated...'),
  seq.pause(800),
  seq.call(() => console.log('Scan progress 50%')),
  seq.type('#speaker', ' Vulnerabilities detected: 0', { mode: 'append' }),
  seq.pause(1200),
  seq.erase('#speaker', { eraseStyle: 'fade', duration: 400 }),
  seq.type('#speaker', 'Agent: Ready for mission.')
]);
```

## Step Helper Reference

TypeFlow exports the `seq` helper object for constructing strongly-typed sequence steps:

| Helper | Arguments | Description |
| :--- | :--- | :--- |
| `seq.type()` | `target?, text, config?` | Types text into the specified element. |
| `seq.erase()` | `target?, config?` | Erases content from the specified element. |
| `seq.pause()` | `duration` | Pauses execution for `duration` milliseconds. |
| `seq.call()` | `fn: () => void \| Promise<void>` | Runs an arbitrary synchronous or asynchronous callback. |

## Sequence Configuration

You can provide default options to the sequence runner:

```javascript
TypeFlow.sequence([
  seq.type(undefined, 'Step One'),
  seq.pause(500),
  seq.erase(),
  seq.type(undefined, 'Step Two')
], {
  target: '#default-container', // Default target for steps omitting a target
  repeat: 3                     // Loop 3 times (or Infinity for infinite loops)
});
```
