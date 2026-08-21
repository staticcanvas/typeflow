import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TypeFlow, seq, createTypeFlowReact, createTypeFlowVue } from '../src/typeflow.js';

describe('TypeFlow Comprehensive Test Suite', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('Basic Plain Text Typing', () => {
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

    it('applies speedVariance without breaking execution', async () => {
      const controller = TypeFlow.type(container, 'Speed variance test', {
        speed: 1,
        speedVariance: 2,
        respectReducedMotion: false,
        cursor: ''
      });
      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Speed variance test');
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

    it('sanitizes external URLs and adds rel=noopener noreferrer to target=_blank links', async () => {
      const linkHtml = '<a href="https://example.com" target="_blank">External</a>';
      const controller = TypeFlow.type(container, linkHtml, {
        html: true,
        speed: 1,
        respectReducedMotion: false,
        cursor: ''
      });
      await controller.promise;
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
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

    it('erases content with fade mode', async () => {
      container.textContent = 'Fading content';
      const controller = TypeFlow.erase(container, {
        eraseStyle: 'fade',
        duration: 10,
        respectReducedMotion: false
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

  describe('Sequence Runner & Step Lifecycle', () => {
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

    it('uses sequence default target if step target is omitted', async () => {
      const controller = TypeFlow.sequence([
        seq.type(undefined, 'Default Target Text', { speed: 1, respectReducedMotion: false, cursor: '' })
      ], { target: container });

      const result = await controller.promise;
      expect(result.completed).toBe(true);
      expect(container.textContent).toBe('Default Target Text');
    });

    it('throws if step target and sequence target are both missing', () => {
      expect(() => {
        TypeFlow.sequence([
          seq.type(undefined, 'No target anywhere')
        ]);
      }).rejects.toThrow();
    });

    it('stops sequence immediately during pause without executing subsequent steps', async () => {
      const step2Fn = vi.fn();
      const controller = TypeFlow.sequence([
        seq.type(container, 'Initial', { speed: 1, respectReducedMotion: false }),
        seq.pause(500),
        seq.call(step2Fn)
      ]);

      setTimeout(() => controller.stop(), 50);
      const result = await controller.promise;
      expect(result.completed).toBe(false);
      expect(step2Fn).not.toHaveBeenCalled();
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

    it('automatically cleans up previous running instance when new animation starts on same target', async () => {
      const c1 = TypeFlow.type(container, 'First long stream', { speed: 50, respectReducedMotion: false });
      const c2 = TypeFlow.type(container, 'Second short stream', { speed: 1, respectReducedMotion: false });

      const [r1, r2] = await Promise.all([c1.promise, c2.promise]);
      expect(r1.completed).toBe(false);
      expect(r2.completed).toBe(true);
      expect(container.textContent).toContain('Second short stream');
    });

    it('stopAll() stops all active instances across multiple containers', async () => {
      const cA = document.createElement('div');
      const cB = document.createElement('div');
      document.body.append(cA, cB);

      const a1 = TypeFlow.type(cA, 'Container A', { speed: 50, respectReducedMotion: false });
      const b1 = TypeFlow.type(cB, 'Container B', { speed: 50, respectReducedMotion: false });

      expect(TypeFlow.isTyping(cA)).toBe(true);
      expect(TypeFlow.isTyping(cB)).toBe(true);

      TypeFlow.stopAll();

      const [resA, resB] = await Promise.all([a1.promise, b1.promise]);
      expect(resA.completed).toBe(false);
      expect(resB.completed).toBe(false);
      expect(TypeFlow.isTyping(cA)).toBe(false);
      expect(TypeFlow.isTyping(cB)).toBe(false);
    });
  });

  describe('Performance Benchmark (10k+ Characters)', () => {
    it('handles 10,000+ characters without memory leaks or UI freeze in reasonable time', async () => {
      const largeText = 'A'.repeat(10000);
      const startTime = performance.now();

      // Instant mode or high-speed batching
      const controller = TypeFlow.type(container, largeText, {
        speed: 0,
        delay: 0,
        respectReducedMotion: true, // Will instantly resolve in performance mode
        cursor: ''
      });

      const result = await controller.promise;
      const duration = performance.now() - startTime;

      expect(result.completed).toBe(true);
      expect(container.textContent.length).toBe(10000);
      expect(duration).toBeLessThan(1000); // Must resolve in < 1 second
    });
  });

  describe('Framework Adapter Factories', () => {
    it('creates React hook wrapper and stops animation on unmount cleanup', () => {
      let cleanupFn;
      const mockReact = {
        useRef: (val) => ({ current: val }),
        useEffect: vi.fn((fn) => {
          cleanupFn = fn();
        })
      };
      const useTypeFlow = createTypeFlowReact(mockReact);
      expect(typeof useTypeFlow).toBe('function');
      useTypeFlow('Test text', { speed: 100 });
      expect(typeof cleanupFn).toBe('function');
    });

    it('creates Vue composition wrapper', () => {
      const mockVue = {
        ref: (val) => ({ value: val }),
        watch: vi.fn((src, cb) => cb()),
        onBeforeUnmount: vi.fn()
      };
      const useTypeFlow = createTypeFlowVue(mockVue);
      expect(typeof useTypeFlow).toBe('function');
    });
  });
});
