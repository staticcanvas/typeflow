import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TypeFlowMetrics } from '../src/typeflow-metrics.js';
import { TypeFlowDebug } from '../src/typeflow-debug.js';
import { TypeFlowWebAudio, createKeystrokeAudio } from '../src/typeflow-webaudio.js';
import { TypeFlowKeystroke, calculateKeyDistance } from '../src/typeflow-keystroke.js';
import { TypeFlowExtChars, EXT_CHARSETS, getExtendedCharset } from '../src/typeflow-extchars.js';

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
});
