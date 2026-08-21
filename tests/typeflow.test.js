import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TypeFlow, seq, createTypeFlowReact, createTypeFlowVue } from '../src/typeflow.js';

describe('TypeFlow Core Engine', () => {
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
  });

  describe('HTML Mode & Sanitization', () => {
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

  describe('Erase Styles', () => {
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
  });

  describe('Sequence Runner', () => {
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
  });

  describe('Rotate Helper', () => {
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
  });

  describe('Framework Adapter Factories', () => {
    it('creates React hook wrapper', () => {
      const mockReact = {
        useRef: (val) => ({ current: val }),
        useEffect: vi.fn((fn) => fn())
      };
      const useTypeFlow = createTypeFlowReact(mockReact);
      expect(typeof useTypeFlow).toBe('function');
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
