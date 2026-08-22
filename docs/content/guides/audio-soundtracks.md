---
title: Audio synthesis & soundtrack synchronization
description: Procedural zero-asset Web Audio keystroke synthesis, custom sound effect hooks, and synchronized MP3 background soundtrack playback.
eyebrow: Guides
category: Guides
keywords:
  - audio
  - sound
  - soundtrack
  - mp3
  - webaudio
  - synthesizers
  - keystrokes
  - clicks
  - sync
---

## Audio Systems in TypeFlow

TypeFlow provides two audio interaction models:
1. **Procedural Web Audio Micro-Synthesizers**: Zero-download keystroke clicks generated in real time using the browser's native `AudioContext`.
2. **Synchronized Soundtrack & SFX Playback**: Media-element synchronization (`HTMLAudioElement` / MP3) tied to animation lifecycles.

---

## 1. Procedural Web Audio Profiles

Enable synthesized keystrokes by setting the `audio` configuration option on `TypeFlow.type()` or `TypeFlow.erase()`:

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';

TypeFlow.type('#terminal-output', 'Initializing telemetry subsystem...', {
  speed: 35,
  audio: 'mechanical', // 'mechanical' | 'beep' | 'synth'
});
```

### Available Synthesizer Profiles

| Profile Name | Synthesizer Architecture | Sound Description |
| :--- | :--- | :--- |
| **`mechanical`** | Noise burst + 800Hz bandpass filter + 18ms exponential decay | Realistic blue/brown mechanical switch click. |
| **`beep`** | Sine wave oscillator (1200Hz) + fast ADSR gain envelope | Classic teletype and mainframe terminal acoustic ping. |
| **`synth`** | Frequency ramp (600Hz $\to$ 120Hz) modulated carrier | Cyberpunk chirps and futuristic HUD telemetry sounds. |

---

## 2. Custom Keystroke Audio Callbacks

Supply a custom function to `audio` to trigger your own audio engines (e.g. Howler.js, Tone.js, or Web Audio graph):

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';

TypeFlow.type('#custom-stage', 'Playing custom dynamic audio ticks...', {
  speed: 40,
  audio: (char, index) => {
    // Custom audio trigger per character
    playKeystrokeSample({ pitch: 1.0 + (index % 5) * 0.05 });
  }
});
```

---

## 3. Synchronized MP3 Soundtrack Playback

When pairing typography animation with background music or cinematic soundscapes, synchronize the audio lifecycle with TypeFlow's controller hooks (`onComplete`, `onInterrupt`):

```javascript
import { TypeFlow } from '@staticcanvas/typeflow';

// Load background soundtrack asset
const soundtrack = new Audio('/assets/audio/alexzavesa-dance-playful-night-510786.mp3');
soundtrack.volume = 0.6;
soundtrack.loop = true;

// Start soundtrack alongside typing animation
soundtrack.play().catch(() => {
  // Handle browser autoplay policy restrictions
});

const controller = TypeFlow.type('#hero-text', 'Experience the rhythm of TypeFlow.', {
  speed: 35,
  onComplete: () => {
    // Smoothly fade out audio on finish
    fadeOutAudio(soundtrack, 600);
  },
  onInterrupt: () => {
    soundtrack.pause();
    soundtrack.currentTime = 0;
  }
});

function fadeOutAudio(audio, durationMs) {
  const stepTime = 50;
  const stepDrop = audio.volume / (durationMs / stepTime);
  const fadeInterval = setInterval(() => {
    if (audio.volume > stepDrop) {
      audio.volume -= stepDrop;
    } else {
      audio.volume = 0;
      audio.pause();
      clearInterval(fadeInterval);
    }
  }, stepTime);
}
```

---

## 4. Browser Autoplay & SSR Safety

1. **User Gesture Requirement**: Modern browsers restrict automatic audio playback until the user has interacted with the document (click, tap, keypress). TypeFlow safely catches and suppresses unhandled autoplay rejection errors.
2. **SSR & Headless Testing**: In Node.js, JSDOM, or server environments where `window.AudioContext` does not exist, TypeFlow silences audio gracefully without throwing runtime errors.
