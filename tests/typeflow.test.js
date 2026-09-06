import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TypeFlow,
  seq,
  createTypeFlowReact,
  createTypeFlowVue,
  createTypeFlowSvelte,
  createTypeFlowSolid,
  createTypeFlowAlpine,
  defineTypeFlowElement,
} from '../src/typeflow.js';
import { installParallel } from '../src/typeflow-parallel.js';

describe('TypeFlow Comprehensive Test Suite', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('Basic Plain Text & Grapheme/Word Granularity', () => {
    it('types text synchronously when respectReducedMotion is triggered or animation completes', async () => {
      const controller = TypeFlow.type(container, 'Hello World', {
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Hello World');
    });

    it('types text by word granularity when configured', async () => {
      const controller = TypeFlow.type(container, 'Streaming word by word', {
        typeStyle: 'word',
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Streaming word by word');
    });

    it('fades words without changing their final layout text', async () => {
      const controller = TypeFlow.type(container, 'Stable word positions', {
        typeStyle: 'word-fade',
        wordStagger: 1,
        wordFadeDuration: 1,
        delay: 10,
        respectReducedMotion: false,
        cursor: ''
      });

      expect(container.textContent).toBe('Stable word positions');
      const words = [...container.querySelectorAll('.tf-word-fade')];
      expect(words).toHaveLength(3);
      expect(words.every((word) => word.style.opacity === '0')).toBe(true);
      expect(words.map((word) => word.dataset.tfWordOrder)).toEqual(['0', '1', '2']);

      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Stable word positions');
      expect(container.querySelector('.tf-word-fade')).toBeNull();
    });

    it('supports reverse and deterministic random word-fade order', () => {
      const reverse = TypeFlow.type(container, 'one two three', {
        typeStyle: 'word-fade',
        wordOrder: 'right-to-left',
        delay: 100,
        respectReducedMotion: false,
        cursor: ''
      });
      expect([...container.querySelectorAll('.tf-word-fade')].map((word) => word.dataset.tfWordOrder)).toEqual(['2', '1', '0']);
      reverse.stop();

      const second = document.createElement('div');
      document.body.appendChild(second);
      const firstRandom = TypeFlow.type(container, 'one two three four', {
        typeStyle: 'word-fade', wordOrder: 'random', wordSeed: 'fixture', delay: 100, respectReducedMotion: false, cursor: ''
      });
      const secondRandom = TypeFlow.type(second, 'one two three four', {
        typeStyle: 'word-fade', wordOrder: 'random', wordSeed: 'fixture', delay: 100, respectReducedMotion: false, cursor: ''
      });
      const orderFor = (element) => [...element.querySelectorAll('.tf-word-fade')].map((word) => word.dataset.tfWordOrder);
      expect(orderFor(container)).toEqual(orderFor(second));
      firstRandom.stop();
      secondRandom.stop();
    });

    it('preserves sanitized HTML and supports hidden word placeholders', async () => {
      const controller = TypeFlow.type(container, 'Safe <strong>word fade</strong>', {
        html: true,
        typeStyle: 'word-fade',
        wordLayout: 'placeholder',
        wordStagger: 1,
        wordFadeDuration: 1,
        delay: 10,
        respectReducedMotion: false,
        cursor: ''
      });
      expect([...container.querySelectorAll('.tf-word-fade')].every((word) => word.style.visibility === 'hidden')).toBe(true);
      await controller.promise;
      expect(container.querySelector('strong')?.textContent).toBe('word fade');
      expect(container.textContent).toBe('Safe word fade');
    });

    it('handles naturalCadence punctuation pauses without error', async () => {
      const controller = TypeFlow.type(container, 'Hello. Welcome, friend!', {
        speed: 1,
        naturalCadence: true,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Hello. Welcome, friend!');
    });

    it('handles emojis and multi-byte graphemes properly without slicing errors', async () => {
      const emojiText = 'Rocket 🚀 Launch 👨‍👩‍👧‍👦 Success';
      const controller = TypeFlow.type(container, emojiText, {
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe(emojiText);
    });

    it('can be stopped mid-animation without rejecting the promise', async () => {
      const controller = TypeFlow.type(container, 'A very long text sequence', {
        speed: 100,
        respectReducedMotion: false,
        cursor: ''
      });
      controller.stop();
      const result = await controller.promise;
      expect(result.completed).toBe(false);
    });

    it('stops cancellable audio callbacks when an animation is interrupted', async () => {
      const audio = Object.assign(vi.fn(), { stop: vi.fn() });
      const controller = TypeFlow.type(container, 'Audio cleanup', {
        audio,
        speed: 100,
        respectReducedMotion: false,
        cursor: '',
      });
      controller.stop();
      await controller.promise;
      expect(audio.stop).toHaveBeenCalledOnce();
    });
  });

  describe('Spatial Word-Motion Reveal & Erase (float-in-*, zoom-in-space)', () => {
    it.each([
      ['float-in-top', 'translateY(0)'],
      ['float-in-bottom', 'translateY(0)'],
      ['float-in-left', 'translateX(0)'],
      ['float-in-right', 'translateX(0)'],
      ['zoom-in-space', 'translateZ(0) scale(1)'],
    ])('types with %s reveal, ending on clean final DOM', async (typeStyle, visibleTransform) => {
      const controller = TypeFlow.type(container, 'Stable spatial words', {
        typeStyle,
        wordStagger: 1,
        wordFadeDuration: 1,
        delay: 10,
        respectReducedMotion: false,
        cursor: '',
      });

      const words = [...container.querySelectorAll('.tf-word-fade')];
      expect(words).toHaveLength(3);
      expect(words.every((word) => word.style.display === 'inline-block')).toBe(true);
      expect(words.every((word) => word.style.opacity === '0')).toBe(true);
      expect(words.every((word) => word.style.transform !== '' && word.style.transform !== visibleTransform)).toBe(true);

      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Stable spatial words');
      expect(container.querySelector('.tf-word-fade')).toBeNull();
      expect(container.style.perspective).toBe('');
    });

    it('erases with a float-in-* style and restores the preserved baseline', async () => {
      const typed = await TypeFlow.type(container, 'Baseline kept here', {
        mode: 'append',
        respectReducedMotion: false,
        cursor: '',
      }).promise;
      expect(typed.completed).toBe(true);

      const controller = TypeFlow.erase(container, {
        eraseStyle: 'float-in-bottom',
        wordStagger: 1,
        wordFadeDuration: 1,
        respectReducedMotion: false,
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('');
    });

    it('sets a CSS perspective on the target only while zoom-in-space is active', () => {
      const controller = TypeFlow.type(container, 'Depth reveal', {
        typeStyle: 'zoom-in-space',
        wordStagger: 100,
        wordFadeDuration: 100,
        delay: 100,
        respectReducedMotion: false,
        cursor: '',
      });
      expect(container.style.perspective).not.toBe('');
      expect(container.style.transformStyle).toBe('preserve-3d');
      controller.stop();
      expect(container.style.perspective).toBe('');
    });

    it('preserves whitespace, punctuation, nested HTML, bidi text, and CJK text', async () => {
      const source = 'Line one\n\t<strong>مرحبا, 世界!</strong>  e\u0301lan';
      const controller = TypeFlow.type(container, source, {
        html: true,
        typeStyle: 'float-in-left',
        wordStagger: 1,
        wordFadeDuration: 1,
        delay: 1,
        respectReducedMotion: false,
        cursor: '',
      });

      expect(container.textContent).toBe('Line one\n\tمرحبا, 世界!  e\u0301lan');
      expect(container.querySelector('strong')?.textContent).toBe('مرحبا, 世界!');
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.innerHTML).toBe('Line one\n\t<strong>مرحبا, 世界!</strong>  e\u0301lan');
      expect(container.querySelector('.tf-word-fade')).toBeNull();
      expect(container.hasAttribute('aria-busy')).toBe(false);
    });

    it('removes transient wrappers and accessibility state when interrupted', async () => {
      const interrupted = vi.fn();
      const controller = TypeFlow.type(container, '<a href="/next">Interrupt safely</a>', {
        html: true,
        typeStyle: 'zoom-in-space',
        wordStagger: 100,
        wordFadeDuration: 100,
        delay: 100,
        respectReducedMotion: false,
        cursor: '',
        onInterrupt: interrupted,
      });

      expect(container.querySelector('.tf-word-fade')).not.toBeNull();
      expect(container.getAttribute('aria-busy')).toBe('true');
      controller.stop();
      expect(await controller.promise).toEqual({ completed: false, text: '<a href="/next">Interrupt safely</a>' });
      expect(interrupted).toHaveBeenCalledOnce();
      expect(container.innerHTML).toBe('<a href="/next">Interrupt safely</a>');
      expect(container.querySelector('.tf-word-fade')).toBeNull();
      expect(container.hasAttribute('aria-busy')).toBe(false);
      expect(container.style.perspective).toBe('');
      expect(container.style.transformStyle).toBe('');
    });

    it('respects prefers-reduced-motion by rendering the final text instantly', async () => {
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
        const controller = TypeFlow.type(container, 'Reduced motion text', {
          typeStyle: 'float-in-top',
          respectReducedMotion: true,
          cursor: '',
        });
        const result = await controller.promise;
        expect(result.completed).toBe(true);
        expect(container.textContent).toBe('Reduced motion text');
        expect(container.querySelector('.tf-word-fade')).toBeNull();
        expect(container.style.perspective).toBe('');
      } finally {
        window.matchMedia = originalMatchMedia;
      }
    });
  });

  describe('Scramble / Matrix Decrypt Reveal & Erase', () => {
    it('types text with scramble reveal style', async () => {
      const controller = TypeFlow.type(container, 'Cyberpunk Matrix', {
        typeStyle: 'scramble',
        scrambleRounds: 1,
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Cyberpunk Matrix');
    });

    it('erases text with scramble erase style', async () => {
      container.textContent = 'Decrypted Text';
      const controller = TypeFlow.erase(container, {
        eraseStyle: 'scramble',
        scrambleRounds: 1,
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('');
    });
  });

  describe('HTML Mode, Deep Nesting & Void Elements', () => {
    it('preserves structured HTML tags and builds balanced fragments', async () => {
      const controller = TypeFlow.type(container, 'Hello <strong>World</strong>!', {
        html: true,
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      const strong = container.querySelector('strong');
      expect(strong).not.toBeNull();
      expect(strong.textContent).toBe('World');
    });

    it('correctly handles deeply nested elements (div > span > strong > em)', async () => {
      const complexHtml = '<span>Layer 1 <strong>Layer 2 <em>Layer 3</em></strong></span>';
      const controller = TypeFlow.type(container, complexHtml, {
        html: true,
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      const em = container.querySelector('em');
      expect(em).not.toBeNull();
      expect(em.textContent).toBe('Layer 3');
      expect(em.parentElement.tagName.toLowerCase()).toBe('strong');
    });

    it('correctly handles void elements like <br> and <hr>', async () => {
      const htmlWithVoid = 'First line<br>Second line';
      const controller = TypeFlow.type(container, htmlWithVoid, {
        html: true,
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.querySelector('br')).not.toBeNull();
      expect(container.textContent).toContain('First line');
      expect(container.textContent).toContain('Second line');
    });

    it('strips unsafe script injection and inline event handlers', async () => {
      const dirty = '<span onclick="alert(1)">Click</span><script>evil()</script>';
      const controller = TypeFlow.type(container, dirty, {
        html: true,
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      await controller.promise;
      expect(container.querySelector('script')).toBeNull();
      const span = container.querySelector('span');
      expect(span).not.toBeNull();
      expect(span.getAttribute('onclick')).toBeNull();
    });
  });

  describe('Erase Styles & Baseline Preservation', () => {
    it('erases content with instant mode', async () => {
      container.textContent = 'Existing Text';
      const controller = TypeFlow.erase(container, { eraseStyle: 'instant' });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('');
    });

    it('erases content with end (backspace) mode', async () => {
      container.textContent = 'Erase Me';
      const controller = TypeFlow.erase(container, {
        eraseStyle: 'end',
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('');
    });

    it('erases content with start (erosion) mode', async () => {
      container.textContent = 'Erase Me';
      const controller = TypeFlow.erase(container, {
        eraseStyle: 'start',
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('');
    });

    it('erases words with stable layout in configured order', async () => {
      container.textContent = 'fade these words';
      const controller = TypeFlow.erase(container, {
        eraseStyle: 'word-fade',
        wordOrder: 'right-to-left',
        wordStagger: 1,
        wordFadeDuration: 1,
        delay: 10,
        respectReducedMotion: false,
        cursor: ''
      });
      expect(container.textContent).toBe('fade these words');
      expect([...container.querySelectorAll('.tf-word-fade')].map((word) => word.dataset.tfWordOrder)).toEqual(['2', '1', '0']);
      expect((await controller.promise).completed).toBe(true);
      expect(container.textContent).toBe('');
    });

    it('preserves baseline prefix when typed with mode: append', async () => {
      await TypeFlow.type(container, 'Prefix: ', { mode: 'replace', speed: 1, respectReducedMotion: false, cursor: '' }).promise;
      await TypeFlow.type(container, 'Dynamic part', { mode: 'append', speed: 1, respectReducedMotion: false, cursor: '' }).promise;
      expect(container.textContent).toBe('Prefix: Dynamic part');

      await TypeFlow.erase(container, { eraseStyle: 'instant', preserveBaseline: true }).promise;
      expect(container.textContent).toBe('Prefix: ');
    });
  });

  describe('Sequence Runner & seq.visible() Step', () => {
    it('executes steps sequentially including type, pause, and call', async () => {
      const calledFn = vi.fn();
      const controller = TypeFlow.sequence([
        seq.type(container, 'Step 1', { speed: 1, respectReducedMotion: false, cursor: '' }),
        seq.pause(10),
        seq.call(calledFn),
        seq.erase(container, { eraseStyle: 'instant' }),
        seq.type(container, 'Step 2', { speed: 1, respectReducedMotion: false, cursor: '' })
      ]);

      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(calledFn).toHaveBeenCalled();
      expect(container.textContent).toBe('Step 2');
    });

    it('resolves seq.visible() step without error', async () => {
      window.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
        observe: vi.fn(() => callback([{ isIntersecting: true }])),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      }));

      const controller = TypeFlow.sequence([
        seq.visible(container),
        seq.type(container, 'Visible content', { speed: 1, respectReducedMotion: false, cursor: '' })
      ]);
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Visible content');
    });
  });

  describe('Experimental Parallel Runner', () => {
    beforeEach(() => installParallel(TypeFlow, seq));
    it('types multiple targets with bounded concurrency and input-ordered results', async () => {
      const targets = Array.from({ length: 4 }, () => document.body.appendChild(document.createElement('div')));
      let active = 0;
      let peak = 0;
      const steps = targets.map((target, index) => seq.call(async () => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 5));
        target.textContent = String(index);
        active -= 1;
      }));

      const result = await TypeFlow.parallel(steps, { concurrency: 2 }).promise;
      expect(result.completed).toBe(true);
      expect(peak).toBe(2);
      expect(result.results.map((entry) => entry.status)).toEqual(Array(4).fill('fulfilled'));
      expect(targets.map((target) => target.textContent)).toEqual(['0', '1', '2', '3']);
    });

    it('supports type, erase, per-step config delays, empty groups, and repeated targets deterministically', async () => {
      const second = document.body.appendChild(document.createElement('div'));
      second.textContent = 'erase me';
      const result = await TypeFlow.parallel([
        seq.type(container, 'first operation', { speed: 20, delay: 5, respectReducedMotion: false, cursor: '' }),
        seq.type(container, 'replacement', { speed: 1, respectReducedMotion: false, cursor: '' }),
        seq.erase(second, { eraseStyle: 'instant', delay: 5 }),
      ]).promise;

      expect(result.completed).toBe(false);
      expect(result.results.map((entry) => entry.status)).toEqual(['interrupted', 'fulfilled', 'fulfilled']);
      expect(container.textContent).toBe('replacement');
      expect(second.textContent).toBe('');
      await expect(TypeFlow.parallel([]).promise).resolves.toEqual({ completed: true, text: '', results: [] });
    });

    it('captures failures with all-settled and stops siblings with fail-fast', async () => {
      const allSettled = await TypeFlow.parallel([
        seq.call(() => { throw new Error('expected'); }),
        seq.call(() => 'still runs'),
      ], { settlement: 'all-settled' }).promise;
      expect(allSettled.results.map((entry) => entry.status)).toEqual(['rejected', 'fulfilled']);

      const slow = TypeFlow.type(container, 'slow sibling', { speed: 100, respectReducedMotion: false, cursor: '' });
      slow.stop();
      await slow.promise;
      const failFast = await TypeFlow.parallel([
        seq.type(container, 'will stop', { speed: 100, respectReducedMotion: false, cursor: '' }),
        seq.call(() => { throw new Error('fail fast'); }),
        seq.call(() => { throw new Error('must not start'); }),
      ], { concurrency: 2, settlement: 'fail-fast' }).promise;
      expect(failFast.completed).toBe(false);
      expect(failFast.results[0].status).toBe('interrupted');
      expect(failFast.results[1].status).toBe('rejected');
      expect(failFast.results[2].status).toBe('interrupted');
    });

    it('supports nested parallel groups and propagates stop()', async () => {
      const second = document.body.appendChild(document.createElement('div'));
      const nested = TypeFlow.parallel([
        seq.parallel([
          seq.type(container, 'left', { speed: 1, respectReducedMotion: false, cursor: '' }),
          seq.type(second, 'right', { speed: 1, respectReducedMotion: false, cursor: '' }),
        ]),
        seq.call(() => { container.dataset.joined = 'true'; }),
      ], { concurrency: 1 });
      expect((await nested.promise).completed).toBe(true);
      expect(container.dataset.joined).toBe('true');

      const stopped = TypeFlow.parallel([
        seq.type(container, 'a long child operation', { speed: 100, respectReducedMotion: false, cursor: '' }),
        seq.pause(10_000),
      ]);
      stopped.stop();
      const stoppedResult = await stopped.promise;
      expect(stoppedResult.completed).toBe(false);
      expect(stoppedResult.results.every((entry) => entry.status === 'interrupted')).toBe(true);
    });
  });

  describe('Rotate Helper & Watch Utility', () => {
    it('runs rotation across word list', async () => {
      const controller = TypeFlow.rotate(container, ['First', 'Second'], {
        typeConfig: { speed: 1, respectReducedMotion: false, cursor: '' },
        eraseConfig: { eraseStyle: 'instant' },
        holdDuration: 10,
        pauseBetween: 10,
        repeat: 1
      });

      const result = await controller.promise;
      expect(result.completed).toBe(true);
    });

    it('observes and animates dynamically added DOM nodes with watch()', async () => {
      const parent = document.createElement('div');
      document.body.appendChild(parent);

      const callback = vi.fn();
      const watcher = TypeFlow.watch(parent, '.dynamic-item', callback);

      const child = document.createElement('span');
      child.className = 'dynamic-item';
      parent.appendChild(child);

      // Allow MutationObserver tick
      await new Promise((r) => setTimeout(r, 20));
      expect(callback).toHaveBeenCalledWith(child);

      watcher.disconnect();
    });
  });

  describe('Concurrency, Stop, and isTyping State', () => {
    it('accurately reports isTyping during animation lifecycle', async () => {
      expect(TypeFlow.isTyping(container)).toBe(false);
      const controller = TypeFlow.type(container, 'Active typing', {
        speed: 50,
        respectReducedMotion: false
      });
      expect(TypeFlow.isTyping(container)).toBe(true);

      controller.stop();
      expect(TypeFlow.isTyping(container)).toBe(false);
    });

    it('stopAll() stops all active instances across multiple containers', async () => {
      const cA = document.createElement('div');
      const cB = document.createElement('div');
      document.body.append(cA, cB);

      const a1 = TypeFlow.type(cA, 'Container A', { speed: 50, respectReducedMotion: false });
      const b1 = TypeFlow.type(cB, 'Container B', { speed: 50, respectReducedMotion: false });

      TypeFlow.stopAll();

      const [resA, resB] = await Promise.all([a1.promise, b1.promise]);
      expect(resA.completed).toBe(false);
      expect(resB.completed).toBe(false);
    });
  });

  describe('Performance Benchmark (10k+ Characters)', () => {
    it('handles 10,000+ characters in under 1 second', async () => {
      const largeText = 'A'.repeat(10000);
      const startTime = performance.now();

      // Instantly clear or instant animation
      const controller = TypeFlow.erase(container, { eraseStyle: 'instant' });
      await controller.promise;

      // Mock prefersReducedMotion matchMedia for instant typing benchmark
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

      const typeCtrl = TypeFlow.type(container, largeText, {
        respectReducedMotion: true,
        cursor: ''
      });

      const result = await typeCtrl.promise;
      const duration = performance.now() - startTime;

      expect(result.completed).toBe(true);
      expect(container.textContent.length).toBe(10000);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Framework Adapter Factories', () => {
    it('creates React hook wrapper and cleans up on unmount', () => {
      let cleanupFn;
      const mockReact = {
        useRef: (val) => ({ current: container }),
        useEffect: vi.fn((fn) => { cleanupFn = fn(); })
      };
      const useTypeFlow = createTypeFlowReact(mockReact);
      useTypeFlow('Test text', { speed: 100 });
      expect(typeof cleanupFn).toBe('function');
      cleanupFn();
    });

    it('creates Vue composition wrapper', () => {
      const mockVue = {
        ref: (val) => ({ value: container }),
        watch: vi.fn((src, cb) => cb()),
        onBeforeUnmount: vi.fn()
      };
      const useTypeFlow = createTypeFlowVue(mockVue);
      expect(typeof useTypeFlow).toBe('function');
    });
  });

  describe('Directional Reveal & Erase Engines', () => {
    it('reveals text right-to-left (direction: right)', async () => {
      const controller = TypeFlow.type(container, 'Directional Test', {
        direction: 'right',
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Directional Test');
    });

    it('reveals text center-outward (direction: center)', async () => {
      const controller = TypeFlow.type(container, 'Center Outward Test', {
        direction: 'center',
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Center Outward Test');
    });

    it('erases text center-inward (eraseStyle: center)', async () => {
      container.textContent = 'Center Inward Erase';
      const controller = TypeFlow.erase(container, {
        eraseStyle: 'center',
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('');
    });

    it('supports scramble charset presets', async () => {
      const controller = TypeFlow.type(container, 'Matrix Decode', {
        typeStyle: 'scramble',
        scrambleCharset: 'matrix',
        scrambleRounds: 1,
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Matrix Decode');
    });

    it('uses an explicit scrambleGlyphs pool instead of the default charset', async () => {
      vi.useFakeTimers();
      let controller;
      try {
        controller = TypeFlow.type(container, 'AB', {
          typeStyle: 'scramble',
          scrambleGlyphs: 'Ω',
          scrambleRounds: 20,
          speed: 20,
          respectReducedMotion: false,
          cursor: ''
        });
        // Twenty initial scramble ticks precede the first revealed character.
        await vi.advanceTimersByTimeAsync(220);
        expect(container.querySelector('.tf-scramble')?.textContent).toBe('Ω');
      } finally {
        controller?.stop();
        await controller?.promise;
        vi.useRealTimers();
      }
    });
  });

  describe('Smart Morph Diff Typing', () => {
    it('morphs text by computing common prefix and replacing changed suffix', async () => {
      container.textContent = 'Hello World';
      const controller = TypeFlow.morph(container, 'Hello Universe', {
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Hello Universe');
    });
  });

  describe('Stream Ingestion Engine', () => {
    it('queues and sequentially consumes token chunks', async () => {
      const stream = TypeFlow.stream(container, {
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      stream.push('First ');
      stream.push('Second ');
      stream.push('Third');

      // Wait a few ticks for processing to complete
      await new Promise((r) => setTimeout(r, 120));
      expect(container.textContent).toBe('First Second Third');
    });
  });

  describe('Trailing Fade & Multi-Target Stagger', () => {
    it('reveals text with trailing fade gradient without DOM corruption', async () => {
      const controller = TypeFlow.type(container, 'Soft Trailing Glow', {
        typeStyle: 'fade-trail',
        trailFade: 4,
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Soft Trailing Glow');
    });

    it('erases text with trailing fade gradient', async () => {
      container.textContent = 'Dissolve Me';
      const controller = TypeFlow.erase(container, {
        eraseStyle: 'fade-trail',
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('');
    });

    it('executes staggered multi-target typing', async () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      document.body.append(el1, el2);

      const controller = TypeFlow.stagger([el1, el2], ['Line 1', 'Line 2'], {
        speed: 1,
        stagger: 5,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(el1.textContent).toBe('Line 1');
      expect(el2.textContent).toBe('Line 2');
    });
  });

  describe('Animation Presets', () => {
    it('returns valid configurations for preset profiles', () => {
      const cp = TypeFlow.preset('cyberpunk', { speed: 20 });
      expect(cp.typeStyle).toBe('scramble');
      expect(cp.scrambleCharset).toBe('matrix');
      expect(cp.speed).toBe(20);

      const writer = TypeFlow.preset('writer');
      expect(writer.naturalCadence).toBe(true);
    });
  });

  describe('Framework Adapters', () => {
    it('integrates with Svelte via action lifecycle', async () => {
      const svelteAction = createTypeFlowSvelte();
      const node = document.createElement('h1');
      document.body.appendChild(node);

      const actionInstance = svelteAction(node, {
        text: 'Svelte Action Test',
        config: { speed: 1, respectReducedMotion: false, cursor: '' }
      });

      expect(typeof actionInstance.update).toBe('function');
      expect(typeof actionInstance.destroy).toBe('function');

      await new Promise((r) => setTimeout(r, 50));
      expect(node.textContent).toBe('Svelte Action Test');

      actionInstance.destroy();
    });

    it('integrates with Solid.js signal reactivity', async () => {
      let effectCb = null;
      let cleanupCb = null;

      const mockSolid = {
        createSignal: (v) => [() => v, (nv) => { v = nv; }],
        createEffect: (fn) => { effectCb = fn; fn(); },
        onCleanup: (fn) => { cleanupCb = fn; },
      };

      const useTypeFlow = createTypeFlowSolid(mockSolid);
      const bindNode = useTypeFlow(() => 'Solid Signal Value', {
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });

      const node = document.createElement('div');
      bindNode(node);
      effectCb();

      await new Promise((r) => setTimeout(r, 50));
      expect(node.textContent).toBe('Solid Signal Value');

      cleanupCb?.();
    });

    it('integrates with Alpine.js directive', async () => {
      let directiveHandler = null;
      const mockAlpine = {
        directive: (name, handler) => {
          expect(name).toBe('typeflow');
          directiveHandler = handler;
        },
      };

      createTypeFlowAlpine(mockAlpine);
      expect(typeof directiveHandler).toBe('function');

      const el = document.createElement('span');
      let effectCb = null;
      let cleanupFn = null;

      directiveHandler(
        el,
        { expression: 'msg', modifiers: [] },
        {
          evaluateLater: () => (cb) => cb({ text: 'Alpine Directive Text', config: { speed: 1, respectReducedMotion: false, cursor: '' } }),
          effect: (fn) => { effectCb = fn; fn(); },
          cleanup: (fn) => { cleanupFn = fn; },
        }
      );

      await new Promise((r) => setTimeout(r, 50));
      expect(el.textContent).toBe('Alpine Directive Text');
      cleanupFn?.();
    });

    it('defines and mounts custom <type-flow> Web Component', async () => {
      defineTypeFlowElement();
      const customEl = document.createElement('type-flow');
      customEl.setAttribute('text', 'Web Component Text');
      customEl.setAttribute('speed', '1');
      customEl.setAttribute('cursor', '');
      document.body.appendChild(customEl);

      await new Promise((r) => setTimeout(r, 60));
      expect(customEl.textContent).toBe('Web Component Text');
      customEl.remove();
    });
  });
});
