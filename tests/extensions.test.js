import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TypeFlowMetrics } from '../src/typeflow-metrics.js';
import { TypeFlowDebug } from '../src/typeflow-debug.js';
import {
  TypeFlowWebAudio,
  createKeystrokeAudio,
  AUDIO_PRESETS,
  AUDIO_PRESET_SCHEMA_VERSION,
} from '../src/typeflow-webaudio.js';
import { TypeFlowKeystroke, calculateKeyDistance } from '../src/typeflow-keystroke.js';
import { TypeFlowExtChars, EXT_CHARSETS, getExtendedCharset } from '../src/typeflow-extchars.js';
import { TypeFlowCaret, Caret } from '../src/typeflow-caret.js';

describe('TypeFlow Companion Extensions Suite', () => {
  describe('TypeFlowMetrics', () => {
    afterEach(() => {
      TypeFlowMetrics.unmount();
    });

    it('mounts and unmounts floating HUD without errors', () => {
      const hud = TypeFlowMetrics.mount({ position: 'bottom-right', detailed: false });
      expect(hud).toBeDefined();
      expect(document.getElementById('typeflow-metrics-hud')).not.toBeNull();

      hud.recordTyped(50);
      hud.recordErased(20);
      hud.recordInterruption();

      const snapshot = hud.getSnapshot();
      expect(snapshot.totalTyped).toBe(50);
      expect(snapshot.totalErased).toBe(20);
      expect(snapshot.interruptions).toBe(1);

      TypeFlowMetrics.unmount();
      expect(document.getElementById('typeflow-metrics-hud')).toBeNull();
    });

    it('toggles modal detailed view', () => {
      const hud = TypeFlowMetrics.mount({ detailed: false });
      expect(hud.isExpanded).toBe(false);
      hud.toggleModal(true);
      expect(hud.isExpanded).toBe(true);
      hud.toggleModal(false);
      expect(hud.isExpanded).toBe(false);
    });
  });

  describe('TypeFlowDebug', () => {
    beforeEach(() => {
      TypeFlowDebug.clearHistory();
    });

    it('records and filters debug events based on enabled state', () => {
      TypeFlowDebug.disable();
      TypeFlowDebug.log('debug', 'Test disabled message');
      expect(TypeFlowDebug.getHistory().length).toBe(0);

      TypeFlowDebug.enable({ console: false });
      TypeFlowDebug.log('info', 'Test info message', { count: 42 });
      const history = TypeFlowDebug.getHistory();
      expect(history.length).toBe(2); // Enable + test message
      expect(history[1].message).toBe('Test info message');
      expect(history[1].data.count).toBe(42);

      const exported = JSON.parse(TypeFlowDebug.exportLog());
      expect(Array.isArray(exported)).toBe(true);
      expect(exported.length).toBe(2);
    });

    it('traces animation controller resolution', async () => {
      TypeFlowDebug.enable({ console: false });
      const fakeController = {
        promise: Promise.resolve({ completed: true, text: 'Hello' }),
      };
      TypeFlowDebug.trace(fakeController, 'Headline');
      await fakeController.promise;

      const history = TypeFlowDebug.getHistory();
      const resolved = history.find((h) => h.message.includes('Resolved'));
      expect(resolved).toBeDefined();
      expect(resolved.data.text).toBe('Hello');
    });
  });

  describe('TypeFlowWebAudio', () => {
    const audioParam = () => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
    const createAudioContext = (state = 'running') => {
      const oscillators = [];
      const context = {
        state,
        currentTime: 0,
        destination: {},
        resume: vi.fn(async () => { context.state = 'running'; }),
        close: vi.fn(async () => {}),
        createGain: vi.fn(() => ({ gain: audioParam(), connect: vi.fn(), disconnect: vi.fn() })),
        createStereoPanner: vi.fn(() => ({ pan: audioParam(), connect: vi.fn(), disconnect: vi.fn() })),
        createBiquadFilter: vi.fn(() => ({ frequency: audioParam(), Q: audioParam(), connect: vi.fn(), disconnect: vi.fn() })),
        createOscillator: vi.fn(() => {
          const oscillator = { frequency: audioParam(), detune: audioParam(), connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), addEventListener: vi.fn() };
          oscillators.push(oscillator);
          return oscillator;
        }),
        oscillators,
      };
      return context;
    };

    afterEach(async () => {
      await TypeFlowWebAudio.destroy();
      TypeFlowWebAudio.resetAudioPresets();
      TypeFlowWebAudio.maxPolyphony = 24;
      delete window.AudioContext;
    });

    it('provides mute and volume controls without crashing in non-audio environments', () => {
      TypeFlowWebAudio.setVolume(0.5);
      expect(TypeFlowWebAudio.volume).toBe(0.5);

      TypeFlowWebAudio.mute(true);
      expect(TypeFlowWebAudio.isMuted).toBe(true);

      TypeFlowWebAudio.mute(false);
      expect(TypeFlowWebAudio.isMuted).toBe(false);

      const playFn = createKeystrokeAudio('mechanical-blue');
      expect(typeof playFn).toBe('function');
      // Should execute without throwing even in test env
      expect(() => playFn()).not.toThrow();
    });

    it('exposes an immutable versioned preset dataset and compatibility aliases', () => {
      expect(AUDIO_PRESET_SCHEMA_VERSION).toBe(1);
      expect(Object.isFrozen(AUDIO_PRESETS)).toBe(true);
      expect(TypeFlowWebAudio.getAudioPreset('mechanical')).toBe(AUDIO_PRESETS['mechanical-red']);
      expect(TypeFlowWebAudio.getAudioPreset('beep')).toBe(AUDIO_PRESETS['terminal-beep']);
      expect(TypeFlowWebAudio.getAudioPreset('synth')).toBe(AUDIO_PRESETS.synth);
      expect(AUDIO_PRESETS).toHaveProperty('soft-keyboard');
      expect(AUDIO_PRESETS).toHaveProperty('typewriter');
      expect(AUDIO_PRESETS).toHaveProperty('correction');
    });

    it('validates registration, collision, removal, and reset behavior', () => {
      const config = structuredClone(AUDIO_PRESETS['soft-keyboard']);
      expect(TypeFlowWebAudio.registerAudioPreset('custom-soft', config)).toBe('custom-soft');
      expect(Object.isFrozen(TypeFlowWebAudio.getAudioPreset('custom-soft'))).toBe(true);
      expect(() => TypeFlowWebAudio.registerAudioPreset('custom-soft', config)).toThrow(/already exists/);
      expect(() => TypeFlowWebAudio.registerAudioPreset('unsafe', { ...config, version: 99 })).toThrow(/schema version/);
      expect(() => TypeFlowWebAudio.registerAudioPreset('clipping', {
        ...config,
        actions: { ...config.actions, type: [{ ...config.actions.type[0], gain: { start: 2, end: 0.1 } }] },
      })).toThrow(/gain/);
      expect(TypeFlowWebAudio.removeAudioPreset('custom-soft')).toBe(true);
      expect(TypeFlowWebAudio.getAudioPreset('custom-soft')).toBeNull();
    });

    it('resumes suspended contexts, caps rapid-input polyphony, and tears down cleanly', async () => {
      const context = createAudioContext('suspended');
      window.AudioContext = vi.fn(() => context);
      TypeFlowWebAudio.maxPolyphony = 2;
      TypeFlowWebAudio.play('mechanical-red');
      TypeFlowWebAudio.play('mechanical-red', { action: 'erase' });
      TypeFlowWebAudio.play('mechanical-red');
      expect(context.resume).toHaveBeenCalled();
      expect(TypeFlowWebAudio.activeVoices.size).toBeLessThanOrEqual(2);
      expect(context.oscillators.some((oscillator) => oscillator.stop.mock.calls.length > 1)).toBe(true);
      await TypeFlowWebAudio.destroy();
      expect(TypeFlowWebAudio.activeVoices.size).toBe(0);
      expect(context.close).toHaveBeenCalledOnce();
    });

    it('stops only the voices owned by an interrupted keystroke callback', () => {
      const context = createAudioContext();
      window.AudioContext = vi.fn(() => context);
      const first = createKeystrokeAudio('mechanical-red');
      const second = createKeystrokeAudio('mechanical-brown');
      first();
      second();
      expect(TypeFlowWebAudio.activeVoices.size).toBe(2);

      first.stop();
      expect(TypeFlowWebAudio.activeVoices.size).toBe(1);
      expect(context.oscillators[0].stop.mock.calls.length).toBe(2);
      expect(context.oscillators[1].stop.mock.calls.length).toBe(1);
    });

    it('reuses stereo panners and disconnects them during teardown', async () => {
      const context = createAudioContext();
      window.AudioContext = vi.fn(() => context);
      TypeFlowWebAudio.play('mechanical-red', { pan: 0.25 });
      TypeFlowWebAudio.play('mechanical-brown', { pan: 0.25 });
      expect(context.createStereoPanner).toHaveBeenCalledOnce();
      const panner = TypeFlowWebAudio.panners.get(0.25);
      await TypeFlowWebAudio.destroy();
      expect(panner.disconnect).toHaveBeenCalledOnce();
      expect(TypeFlowWebAudio.panners.size).toBe(0);
    });

    it('does nothing in unsupported browsers', () => {
      delete window.AudioContext;
      delete window.webkitAudioContext;
      expect(TypeFlowWebAudio.getContext()).toBeNull();
      expect(() => TypeFlowWebAudio.play('typewriter')).not.toThrow();
    });

    it('defers context creation until user activation and tolerates autoplay constructor failures', () => {
      const context = createAudioContext();
      let activated = false;
      const descriptor = Object.getOwnPropertyDescriptor(window.navigator, 'userActivation');
      Object.defineProperty(window.navigator, 'userActivation', {
        configurable: true,
        value: { get isActive() { return activated; }, get hasBeenActive() { return activated; } },
      });
      window.AudioContext = vi.fn(() => context);
      expect(TypeFlowWebAudio.getContext()).toBeNull();
      expect(window.AudioContext).not.toHaveBeenCalled();
      activated = true;
      window.dispatchEvent(new Event('pointerdown'));
      expect(window.AudioContext).toHaveBeenCalledOnce();
      TypeFlowWebAudio.ctx = null;
      TypeFlowWebAudio.masterGain = null;
      window.AudioContext = vi.fn(() => { throw new Error('blocked'); });
      expect(TypeFlowWebAudio.getContext()).toBeNull();
      if (descriptor) Object.defineProperty(window.navigator, 'userActivation', descriptor);
      else delete window.navigator.userActivation;
    });

    it('respects reduced-motion sound suppression, mute, and repeated teardown', async () => {
      const context = createAudioContext();
      window.AudioContext = vi.fn(() => context);
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn(() => ({ matches: true }));
      TypeFlowWebAudio.play('synth', { respectReducedMotion: true });
      expect(context.createOscillator).not.toHaveBeenCalled();
      window.matchMedia = originalMatchMedia;

      TypeFlowWebAudio.mute(true);
      TypeFlowWebAudio.play('synth');
      expect(context.createOscillator).not.toHaveBeenCalled();
      TypeFlowWebAudio.mute(false);
      TypeFlowWebAudio.play('synth');
      expect(context.createOscillator).toHaveBeenCalled();
      await TypeFlowWebAudio.destroy();
      await expect(TypeFlowWebAudio.destroy()).resolves.toBeUndefined();
    });
  });

  describe('TypeFlowKeystroke', () => {
    it('calculates physical Euclidean key distances', () => {
      const distAdjacent = calculateKeyDistance('e', 'r');
      const distFar = calculateKeyDistance('q', 'p');
      expect(distFar).toBeGreaterThan(distAdjacent);
    });

    it('computes dynamic delay with punctuation hesitation', () => {
      const delayLetter = TypeFlowKeystroke.getDelay('a', 'b', { baseSpeed: 40 });
      const delayPunct = TypeFlowKeystroke.getDelay('.', 'T', { baseSpeed: 40 });
      expect(delayPunct).toBeGreaterThan(delayLetter);
    });

    it('humanizes text with typo injection and auto-correction actions', () => {
      const actions = TypeFlowKeystroke.humanize('hello world', { errorRate: 1.0 }); // 100% typo rate for test
      expect(actions.length).toBeGreaterThan(11);
      const typoAction = actions.find((a) => a.isTypo === true);
      const eraseAction = actions.find((a) => a.type === 'erase');
      expect(typoAction).toBeDefined();
      expect(eraseAction).toBeDefined();
    });
  });

  describe('TypeFlowExtChars', () => {
    it('provides rich extended Unicode character sets', () => {
      expect(EXT_CHARSETS.hieroglyphs).toBeDefined();
      expect(EXT_CHARSETS.runic).toBeDefined();
      expect(EXT_CHARSETS.katakana).toBeDefined();
      expect(EXT_CHARSETS.boxDrawing).toBeDefined();

      const runic = getExtendedCharset('runic');
      expect(runic).toBe(EXT_CHARSETS.runic);

      const combined = TypeFlowExtChars.combineCharsets('hieroglyphs', 'runic');
      expect(combined.length).toBeGreaterThan(EXT_CHARSETS.runic.length);

      const randomRune = TypeFlowExtChars.randomGlyph('runic');
      expect(typeof randomRune).toBe('string');
      expect(randomRune.length).toBeGreaterThan(0);
    });

    it('allows custom charset registration', () => {
      TypeFlowExtChars.registerCharset('custom-alien', '⏣⌬⏢⏥⏦');
      expect(TypeFlowExtChars.getCharset('custom-alien')).toBe('⏣⌬⏢⏥⏦');
    });
  });

  describe('TypeFlowCaret', () => {
    let container;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    it('initializes from the target text content and reports position/length', () => {
      container.textContent = 'Hello world';
      const caret = new TypeFlowCaret(container, { cursor: '' });
      expect(caret.text).toBe('Hello world');
      expect(caret.length).toBe(11);
      expect(caret.position).toBe(11);
    });

    it('jump() moves to an absolute index and clamps out-of-range values', () => {
      const caret = Caret(container, { text: 'Hello world', cursor: '' });
      caret.jump(5);
      expect(caret.position).toBe(5);
      caret.jump(999);
      expect(caret.position).toBe(11);
      caret.jump(-5);
      expect(caret.position).toBe(0);
    });

    it('move() shifts the caret by a relative delta', () => {
      const caret = Caret(container, { text: 'Hello world', position: 5, cursor: '' });
      caret.move(-5);
      expect(caret.position).toBe(0);
      caret.move(3);
      expect(caret.position).toBe(3);
    });

    it('renders the cursor glyph at the caret position, not just at the end', () => {
      const caret = Caret(container, { text: 'Hello world', cursor: '|', cursorBlink: false });
      caret.jump(5);
      expect(container.textContent).toBe('Hello| world');
    });

    it('deleteChar() removes backward (Backspace) and forward (Delete)', () => {
      const caret = Caret(container, { text: 'Hello world', position: 5, cursor: '' });
      caret.deleteChar('backward');
      expect(caret.text).toBe('Hell world');
      expect(caret.position).toBe(4);

      caret.deleteChar('forward');
      expect(caret.text).toBe('Hellworld');
      expect(caret.position).toBe(4);
    });

    it('deleteWord() removes the adjacent whitespace-delimited word', () => {
      const backward = Caret(container, { text: 'git commit -m wip', position: 17, cursor: '' });
      backward.deleteWord('backward');
      expect(backward.text).toBe('git commit -m ');
      expect(backward.position).toBe(14);

      const second = document.createElement('div');
      document.body.appendChild(second);
      const forward = Caret(second, { text: 'git commit -m wip', position: 4, cursor: '' });
      forward.deleteWord('forward');
      expect(forward.text).toBe('git -m wip');
      expect(forward.position).toBe(4);
    });

    it('insert() types new text at the caret position, shifting the rest right', async () => {
      const caret = Caret(container, { text: 'git commit', cursor: '' });
      caret.jump(4);
      const result = await caret.insert('push --force ', { speed: 1, respectReducedMotion: false }).promise;
      expect(result.completed).toBe(true);
      expect(caret.text).toBe('git push --force commit');
      expect(caret.position).toBe(17);
    });

    it('insert() completes instantly under prefers-reduced-motion', async () => {
      const caret = Caret(container, { text: 'git ', cursor: '', respectReducedMotion: true });
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      try {
        const result = await caret.insert('status').promise;
        expect(result.completed).toBe(true);
        expect(caret.text).toBe('git status');
      } finally {
        window.matchMedia = originalMatchMedia;
      }
    });

    it('insert() can be stopped mid-animation without rejecting the promise', async () => {
      const caret = Caret(container, { text: '', cursor: '' });
      const controller = caret.insert('a very long string to type slowly', { speed: 50, respectReducedMotion: false });
      controller.stop();
      const result = await controller.promise;
      expect(result.completed).toBe(false);
    });

    it('starting a new insert() on the same caret interrupts the previous one', async () => {
      const caret = Caret(container, { text: '', cursor: '' });
      const first = caret.insert('first slow insert', { speed: 50, respectReducedMotion: false });
      const second = caret.insert('second', { speed: 1, respectReducedMotion: false });
      const [firstResult, secondResult] = await Promise.all([first.promise, second.promise]);
      expect(firstResult.completed).toBe(false);
      expect(secondResult.completed).toBe(true);
      expect(caret.text).toBe('second');
    });

    it('defers to a page-global TypeFlow.stop() when starting, if one is present', () => {
      const stop = vi.fn();
      window.TypeFlow = { stop };
      try {
        Caret(container, { text: 'hi', cursor: '' });
        expect(stop).toHaveBeenCalledWith(container);
      } finally {
        delete window.TypeFlow;
      }
    });
  });
});
