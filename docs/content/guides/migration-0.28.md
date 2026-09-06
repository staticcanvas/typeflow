---
title: Migrating to 0.28
description: Compatibility notes for spatial motion, optional audio presets, and the experimental parallel extension.
weight: 95
---

## Compatibility

Existing `TypeFlow.type()`, `erase()`, `sequence()`, audio callbacks, and the
`mechanical`, `beep`, and `synth` names continue to work without changes. The
default renderer remains zero-dependency and preserves its existing options.

## Spatial word motion

The new `float-in-top`, `float-in-bottom`, `float-in-left`, `float-in-right`,
and `zoom-in-space` values are additive `typeStyle` and `eraseStyle` choices.
They map to instant completion when reduced motion is requested. No migration
is required unless an application previously validated style names with its own
closed allow-list.

## Audio presets

Custom versioned presets live in the optional `@staticcanvas/typeflow/webaudio`
export. Import `TypeFlowWebAudio` and call `registerAudioPreset()`; unrestricted
`audio: () => void` callbacks remain supported. Audio contexts are still not a
core dependency.

## Experimental parallel orchestration

Parallel orchestration is not installed by importing core. Applications must
import `installParallel` from `@staticcanvas/typeflow/parallel` and explicitly
install it. Do not treat its result schema as stable yet.
