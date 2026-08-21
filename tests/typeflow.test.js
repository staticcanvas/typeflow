import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TypeFlow, seq, createTypeFlowReact, createTypeFlowVue } from '../src/typeflow.js';

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

    it('preserves baseline prefix when typed with mode: append', async () => {
      await TypeFlow.type(container, 'Prefix: ', { mode: 'replace', speed: 1, respectReducedMotion: false }).promise;
      await TypeFlow.type(container, 'Dynamic part', { mode: 'append', speed: 1, respectReducedMotion: false }).promise;
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
      const controller = TypeFlow.sequence([
        seq.visible(container),
        seq.type(container, 'Visible content', { speed: 1, respectReducedMotion: false })
      ]);
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Visible content');
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
});

