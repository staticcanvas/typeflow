/**
 * TypeFlow - A lightweight, interruptible, framework-agnostic typewriter library
 * @version 2.3.0
 * @license MIT
 *
 * Zero dependencies. Safe by default (no innerHTML string concatenation).
 * Vanilla-first, with Intl.Segmenter support, multi-style reveals, and adapters for React, Vue, Svelte, and Solid.
 */

// ============================================================
// Constants
// ============================================================

const TYPE_DEFAULTS = {
  speed: 50,
  delay: 0,
  speedVariance: 0,
  naturalCadence: false,
  granularity: 'grapheme',
  cursor: '|',
  cursorBlink: true,
  html: false,
  mode: 'replace',
  typeStyle: 'char',
  scrambleGlyphs: '!<>-_\\/[]{}—=+*^?#________',
  scrambleRounds: 2,
  respectReducedMotion: true,
};

const ERASE_DEFAULTS = {
  ...TYPE_DEFAULTS,
  speed: 25,
  cursorBlink: false,
  eraseStyle: 'end',
  preserveBaseline: true,
};

const VOID_ELEMENTS = new Set([
  'br', 'hr', 'img', 'input', 'wbr', 'area', 'base',
  'col', 'embed', 'link', 'meta', 'source', 'track',
]);

const DEFAULT_ALLOWED_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'mark', 'span', 'small', 'sub', 'sup', 'u', 'br', 'a', 'code',
]);

const DEFAULT_ALLOWED_ATTRS = {
  a: new Set(['href', 'title', 'target', 'rel']),
  span: new Set(['class']),
  mark: new Set(['class']),
  '*': new Set(['class']),
};

const CURSOR_SPACER = '\u00A0';
const CURSOR_BLINK_INTERVAL = 530;
const DEFAULT_FADE_DURATION = 250;

// ============================================================
// Intl.Segmenter Helper & Unit Slicing
// ============================================================

function segmentText(text, granularity = 'grapheme') {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  if (granularity === 'word') {
    const matches = text.match(/\s+|\S+/g);
    return matches ? matches : [text];
  }
  return Array.from(text);
}

function getRandomGlyph(glyphs) {
  return glyphs[Math.floor(Math.random() * glyphs.length)];
}

// ============================================================
// Sanitization
// ============================================================

function isSafeUrl(value) {
  const v = value.trim().toLowerCase();
  return !v.startsWith('javascript:') && !v.startsWith('data:') && !v.startsWith('vbscript:');
}

function sanitizeElement(el, allowedTags, allowedAttrs) {
  const tag = el.tagName.toLowerCase();
  if (!allowedTags.has(tag)) return null;

  const clean = document.createElement(tag);
  const allowedForTag = allowedAttrs[tag] ?? new Set();
  const allowedGlobal = allowedAttrs['*'] ?? new Set();

  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    if (name.startsWith('on')) continue;
    if (!allowedForTag.has(name) && !allowedGlobal.has(name)) continue;
    if ((name === 'href' || name === 'src') && !isSafeUrl(attr.value)) continue;
    clean.setAttribute(name, attr.value);
  }

  if (tag === 'a' && clean.getAttribute('target') === '_blank') {
    clean.setAttribute('rel', 'noopener noreferrer');
  }

  return clean;
}

function buildSourceTree(input, plainText, allowedTags, allowedAttrs) {
  const fragment = document.createDocumentFragment();
  if (plainText) {
    fragment.appendChild(document.createTextNode(input));
    return fragment;
  }

  const template = document.createElement('template');
  template.innerHTML = input;

  const walk = (source, target) => {
    source.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        target.appendChild(document.createTextNode(child.textContent ?? ''));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const clean = sanitizeElement(child, allowedTags, allowedAttrs);
        if (clean) {
          target.appendChild(clean);
          walk(child, clean);
        } else {
          walk(child, target);
        }
      }
    });
  };

  walk(template.content, fragment);
  return fragment;
}

// ============================================================
// Reveal Engines
// ============================================================

function countTextUnits(node, granularity = 'grapheme') {
  if (node.nodeType === Node.TEXT_NODE) {
    return segmentText(node.textContent ?? '', granularity).length;
  }
  let total = 0;
  node.childNodes.forEach((child) => (total += countTextUnits(child, granularity)));
  return total;
}

function cloneReveal(node, remaining, granularity = 'grapheme', scrambleOpts) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    const units = segmentText(text, granularity);
    if (remaining <= 0) return { clone: null, remaining };
    if (units.length <= remaining) {
      return { clone: document.createTextNode(text), remaining: remaining - units.length };
    }
    let sliced = units.slice(0, remaining).join('');
    if (scrambleOpts?.active && remaining > 0 && units[remaining - 1]?.trim()) {
      sliced = units.slice(0, remaining - 1).join('') + getRandomGlyph(scrambleOpts.glyphs);
    }
    return { clone: document.createTextNode(sliced), remaining: 0 };
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node;
    const tag = el.tagName.toLowerCase();
    if (VOID_ELEMENTS.has(tag)) {
      if (remaining < 0) return { clone: null, remaining };
      return { clone: el.cloneNode(false), remaining };
    }
    if (remaining <= 0) return { clone: null, remaining };
    const clone = el.cloneNode(false);
    let rem = remaining;
    let appended = false;
    node.childNodes.forEach((child) => {
      if (rem < 0) return;
      const result = cloneReveal(child, rem, granularity, scrambleOpts);
      if (result.clone) { clone.appendChild(result.clone); appended = true; }
      rem = result.remaining;
    });
    return { clone: appended ? clone : null, remaining: rem };
  }
  return { clone: null, remaining };
}

function revealFragment(source, unitCount, granularity = 'grapheme', scrambleOpts) {
  const out = document.createDocumentFragment();
  let remaining = unitCount;
  source.childNodes.forEach((child) => {
    if (remaining < 0) return;
    const result = cloneReveal(child, remaining, granularity, scrambleOpts);
    if (result.clone) out.appendChild(result.clone);
    remaining = result.remaining;
  });
  return out;
}

function cloneRevealSuffix(node, skip, granularity = 'grapheme') {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    const units = segmentText(text, granularity);
    if (skip <= 0) return { clone: document.createTextNode(text), skip: 0 };
    if (skip >= units.length) return { clone: null, skip: skip - units.length };
    return { clone: document.createTextNode(units.slice(skip).join('')), skip: 0 };
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node;
    const tag = el.tagName.toLowerCase();
    if (VOID_ELEMENTS.has(tag)) {
      if (skip > 0) return { clone: null, skip };
      return { clone: el.cloneNode(false), skip };
    }
    const clone = el.cloneNode(false);
    let rem = skip;
    let appended = false;
    node.childNodes.forEach((child) => {
      const result = cloneRevealSuffix(child, rem, granularity);
      if (result.clone) { clone.appendChild(result.clone); appended = true; }
      rem = result.skip;
    });
    return { clone: appended ? clone : null, skip: rem };
  }
  return { clone: null, skip };
}

function revealSuffixFragment(source, skipCount, granularity = 'grapheme') {
  const out = document.createDocumentFragment();
  let skip = skipCount;
  source.childNodes.forEach((child) => {
    const result = cloneRevealSuffix(child, skip, granularity);
    if (result.clone) out.appendChild(result.clone);
    skip = result.skip;
  });
  return out;
}

// ============================================================
// Core Engine
// ============================================================

function resolveTarget(target) {
  const el = resolveMaybeTarget(target);
  if (!el) throw new Error(`TypeFlow: target element not found (${String(target)})`);
  return el;
}

function resolveMaybeTarget(target) {
  return typeof target === 'string' ? document.querySelector(target) : target;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function calculateCadencePause(text, count) {
  if (count <= 0 || count > text.length) return 0;
  const char = text[count - 1];
  if (char === '.' || char === '!' || char === '?') return 220;
  if (char === ',' || char === ';' || char === ':') return 110;
  if (char === ' ') return 40;
  return 0;
}

class TypeFlowEngine {
  active = new Map();
  baselines = new WeakMap();

  animate(
    el,
    sourceTree,
    totalUnits,
    options,
    startCount,
    endCount,
    resultText,
    extra = {}
  ) {
    this.active.get(el)?.stop();
    if (options.ariaLive) el.setAttribute('aria-live', options.ariaLive);

    const prefix = extra.prefix ?? [];
    const renderer = extra.renderer ?? revealFragment;
    const blinkOnFinish = extra.blinkOnFinish ?? false;
    const direction = endCount >= startCount ? 1 : -1;
    const speed = options.speed ?? TYPE_DEFAULTS.speed;
    const granularity = options.granularity ?? TYPE_DEFAULTS.granularity;
    const isScramble = options.typeStyle === 'scramble' || options.eraseStyle === 'scramble';
    const scrambleGlyphs = options.scrambleGlyphs ?? TYPE_DEFAULTS.scrambleGlyphs;

    let settled = false;
    let timeoutId = null;
    let cursorInterval = null;
    let resolveFn = null;

    const clearTimers = () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (cursorInterval !== null) clearInterval(cursorInterval);
      timeoutId = null;
      cursorInterval = null;
    };

    const render = (unitCount, cursorChar, scrambleActive = false) => {
      el.replaceChildren(
        ...prefix,
        renderer(sourceTree, unitCount, granularity, { active: scrambleActive, glyphs: scrambleGlyphs })
      );
      if (cursorChar) el.appendChild(document.createTextNode(cursorChar));
    };

    const settle = (completed) => {
      if (settled) return;
      settled = true;
      clearTimers();
      this.active.delete(el);
      if (completed) {
        render(endCount, '', false);
        if (blinkOnFinish && options.cursor && options.cursorBlink) {
          let visible = true;
          cursorInterval = setInterval(() => {
            render(endCount, visible ? options.cursor : CURSOR_SPACER, false);
            visible = !visible;
          }, CURSOR_BLINK_INTERVAL);
        }
        options.onComplete?.(resultText);
      } else {
        options.onInterrupt?.();
      }
      resolveFn?.({ completed, text: resultText });
    };

    const controller = {
      stop: () => settle(false),
      promise: new Promise((resolve) => { resolveFn = resolve; }),
    };
    this.active.set(el, controller);

    const shouldReduceMotion =
      options.respectReducedMotion === true && prefersReducedMotion();

    if (shouldReduceMotion) {
      settle(true);
      return controller;
    }

    let scrambleStep = 0;
    const scrambleRounds = options.scrambleRounds ?? TYPE_DEFAULTS.scrambleRounds;

    const step = (count) => {
      if (isScramble && scrambleStep < scrambleRounds && count !== endCount) {
        render(count, options.cursor ?? '', true);
        scrambleStep++;
        timeoutId = setTimeout(() => step(count), Math.max(10, speed / 2));
        return;
      }
      scrambleStep = 0;

      render(count, options.cursor ?? '', false);
      if (count === endCount) { settle(true); return; }

      const jitter = options.speedVariance ? (Math.random() * 2 - 1) * options.speedVariance : 0;
      const cadencePause = options.naturalCadence ? calculateCadencePause(resultText, count) : 0;
      const delayMs = Math.max(0, speed + jitter + cadencePause);

      timeoutId = setTimeout(() => step(count + direction), delayMs);
    };

    options.onStart?.();
    timeoutId = setTimeout(() => step(startCount), options.delay ?? 0);
    return controller;
  }

  eraseFade(el, erasableLive, baseline, options) {
    this.active.get(el)?.stop();

    const wrapper = document.createElement('span');
    erasableLive.forEach((n) => wrapper.appendChild(n));
    el.replaceChildren(...baseline, wrapper);

    const duration = options.duration ?? DEFAULT_FADE_DURATION;
    let settled = false;
    let timeoutId = null;
    let resolveFn = null;

    const settle = (completed) => {
      if (settled) return;
      settled = true;
      if (timeoutId !== null) clearTimeout(timeoutId);
      this.active.delete(el);
      if (completed) {
        el.replaceChildren(...baseline);
        options.onComplete?.('');
      } else {
        options.onInterrupt?.();
      }
      resolveFn?.({ completed, text: '' });
    };

    const controller = {
      stop: () => settle(false),
      promise: new Promise((resolve) => { resolveFn = resolve; }),
    };
    this.active.set(el, controller);

    if (options.respectReducedMotion && prefersReducedMotion()) {
      settle(true);
      return controller;
    }

    requestAnimationFrame(() => {
      wrapper.style.transition = `opacity ${duration}ms ease`;
      wrapper.style.opacity = '0';
    });
    timeoutId = setTimeout(() => settle(true), duration);
    return controller;
  }

  instantClear(el, baseline, options) {
    this.active.get(el)?.stop();
    el.replaceChildren(...baseline);
    options.onComplete?.('');
    return { stop: () => {}, promise: Promise.resolve({ completed: true, text: '' }) };
  }

  type(target, text, config = {}) {
    const el = resolveTarget(target);
    const options = { ...TYPE_DEFAULTS, ...config };
    if (options.typeStyle === 'word') options.granularity = 'word';

    const allowedTags = new Set([...DEFAULT_ALLOWED_TAGS, ...(options.allowedTags ?? [])]);
    const allowedAttrs = { ...DEFAULT_ALLOWED_ATTRS };
    if (options.allowedAttributes) {
      for (const [tag, attrs] of Object.entries(options.allowedAttributes)) {
        allowedAttrs[tag] = new Set([...(allowedAttrs[tag] ?? []), ...attrs]);
      }
    }

    let sourceText = String(text);
    if (options.html && options.sanitizer) sourceText = options.sanitizer(sourceText);
    const sourceTree = buildSourceTree(sourceText, !options.html, allowedTags, allowedAttrs);
    const totalUnits = countTextUnits(sourceTree, options.granularity);

    const prefix = options.mode === 'append' ? Array.from(el.childNodes) : [];
    if (options.mode === 'append') this.baselines.set(el, prefix);
    else this.baselines.delete(el);

    return this.animate(el, sourceTree, totalUnits, options, 0, totalUnits, sourceText, {
      prefix,
      blinkOnFinish: true,
    });
  }

  erase(target, config = {}) {
    const el = resolveTarget(target);
    const options = { ...ERASE_DEFAULTS, ...config };

    const baseline = options.preserveBaseline ? this.baselines.get(el) ?? [] : [];
    const allChildren = Array.from(el.childNodes);
    const erasableLive = baseline.length ? allChildren.filter((n) => !baseline.includes(n)) : allChildren;

    if (options.eraseStyle === 'instant') return this.instantClear(el, baseline, options);
    if (options.eraseStyle === 'fade') return this.eraseFade(el, erasableLive, baseline, options);

    const sourceTree = document.createDocumentFragment();
    erasableLive.forEach((n) => sourceTree.appendChild(n.cloneNode(true)));
    const totalUnits = countTextUnits(sourceTree, options.granularity);

    if (options.eraseStyle === 'start') {
      return this.animate(el, sourceTree, totalUnits, options, 0, totalUnits, '', {
        prefix: baseline,
        renderer: revealSuffixFragment,
      });
    }

    return this.animate(el, sourceTree, totalUnits, options, totalUnits, 0, '', { prefix: baseline });
  }

  sequence(steps, seqConfig = {}) {
    let isInterrupted = false;
    let currentSub = null;
    let cancelPause = null;
    let cancelObserver = null;

    const resolveStepTarget = (step) => {
      const target = step.target ?? seqConfig.target;
      if (!target) {
        throw new Error(
          'TypeFlow: a sequence step is missing a target, and no default `target` was set on the sequence config.'
        );
      }
      return target;
    };

    const controller = {
      stop: () => {
        if (isInterrupted) return;
        isInterrupted = true;
        currentSub?.stop();
        cancelPause?.();
        cancelObserver?.();
      },
      promise: null,
    };

    const runOnce = async () => {
      for (const step of steps) {
        if (isInterrupted) return false;

        if (step.kind === 'type') {
          currentSub = this.type(resolveStepTarget(step), step.text, step.config);
          if (!(await currentSub.promise).completed) return false;
        } else if (step.kind === 'erase') {
          currentSub = this.erase(resolveStepTarget(step), step.config);
          if (!(await currentSub.promise).completed) return false;
        } else if (step.kind === 'pause') {
          const finishedNaturally = await new Promise((resolve) => {
            const id = setTimeout(() => resolve(true), step.duration);
            cancelPause = () => { clearTimeout(id); resolve(false); };
          });
          cancelPause = null;
          if (!finishedNaturally) return false;
        } else if (step.kind === 'visible') {
          const targetEl = resolveTarget(resolveStepTarget(step));
          const isVisible = await new Promise((resolve) => {
            if (typeof IntersectionObserver === 'undefined') {
              resolve(true);
              return;
            }
            const observer = new IntersectionObserver((entries) => {
              if (entries.some((e) => e.isIntersecting)) {
                observer.disconnect();
                resolve(true);
              }
            }, { threshold: step.threshold ?? 0.1 });
            cancelObserver = () => { observer.disconnect(); resolve(false); };
            observer.observe(targetEl);
          });
          cancelObserver = null;
          if (!isVisible) return false;
        } else if (step.kind === 'call') {
          await step.fn();
        }

        if (isInterrupted) return false;
      }
      return true;
    };

    controller.promise = (async () => {
      const repeat = seqConfig.repeat ?? 1;
      for (let i = 0; repeat === Infinity || i < repeat; i++) {
        if (!(await runOnce())) return { completed: false, text: '' };
      }
      return { completed: true, text: '' };
    })();

    return controller;
  }

  rotate(target, words, config = {}) {
    const {
      typeConfig = {},
      eraseConfig = {},
      holdDuration = 1200,
      pauseBetween = 200,
      repeat = Infinity,
    } = config;

    const steps = [];
    words.forEach((word) => {
      steps.push({ kind: 'type', target, text: word, config: typeConfig });
      steps.push({ kind: 'pause', duration: holdDuration });
      steps.push({ kind: 'erase', target, config: eraseConfig });
      steps.push({ kind: 'pause', duration: pauseBetween });
    });

    return this.sequence(steps, { repeat });
  }

  watch(container, childSelector, callback) {
    const root = resolveTarget(container);
    root.querySelectorAll(childSelector).forEach(callback);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = node;
          if (el.matches(childSelector)) callback(el);
          el.querySelectorAll(childSelector).forEach(callback);
        });
      }
    });

    observer.observe(root, { childList: true, subtree: true });
    return { disconnect: () => observer.disconnect() };
  }

  stop(target) {
    const el = resolveMaybeTarget(target);
    if (!el) return;
    this.active.get(el)?.stop();
  }

  stopAll() {
    Array.from(this.active.values()).forEach((c) => c.stop());
  }

  isTyping(target) {
    const el = resolveMaybeTarget(target);
    return !!el && this.active.has(el);
  }
}

// ============================================================
// Vanilla Public API (Singleton)
// ============================================================

export const TypeFlow = new TypeFlowEngine();
export default TypeFlow;

export const seq = {
  type: (target, text = '', config) => ({ kind: 'type', target, text, config }),
  erase: (target, config) => ({ kind: 'erase', target, config }),
  pause: (duration) => ({ kind: 'pause', duration }),
  visible: (target, threshold) => ({ kind: 'visible', target, threshold }),
  call: (fn) => ({ kind: 'call', fn }),
};

if (typeof window !== 'undefined') {
  window.TypeFlow = TypeFlow;
  window.TypeFlowSeq = seq;
}

// ============================================================
// React Adapter
// ============================================================

export function createTypeFlowReact(React) {
  return function useTypeFlow(text, config = {}) {
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (!ref.current) return;
      const controller = TypeFlow.type(ref.current, text, config);
      return () => controller.stop();
    }, [text]);
    return ref;
  };
}

export function createTypeFlowSequenceReact(React) {
  return function useTypeFlowSequence(buildSteps, deps) {
    React.useEffect(() => {
      const controller = TypeFlow.sequence(buildSteps());
      return () => controller.stop();
    }, deps);
  };
}

// ============================================================
// Vue Adapter
// ============================================================

export function createTypeFlowVue(Vue) {
  return function useTypeFlow(getText, config = {}) {
    const el = Vue.ref(null);
    let controller = null;
    Vue.watch(getText, () => {
      if (!el.value) return;
      controller = TypeFlow.type(el.value, getText(), config);
    }, { immediate: true });
    Vue.onBeforeUnmount(() => controller?.stop());
    return el;
  };
}

export function createTypeFlowSequenceVue(Vue) {
  return function useTypeFlowSequence(buildSteps) {
    let controller = null;
    const run = () => {
      controller?.stop();
      controller = TypeFlow.sequence(buildSteps());
    };
    Vue.onBeforeUnmount(() => controller?.stop());
    return run;
  };
}

// ============================================================
// Svelte Adapter (Action)
// ============================================================

export function createTypeFlowSvelte() {
  return function typeflowAction(node, params) {
    let controller = null;

    const start = (currentParams) => {
      controller?.stop();
      const text = typeof currentParams === 'string' ? currentParams : currentParams.text;
      const config = typeof currentParams === 'object' ? currentParams.config : {};
      controller = TypeFlow.type(node, text, config);
    };

    start(params);

    return {
      update(newParams) {
        start(newParams);
      },
      destroy() {
        controller?.stop();
      },
    };
  };
}

// ============================================================
// Solid.js Adapter
// ============================================================

export function createTypeFlowSolid(Solid) {
  return function useTypeFlow(getText, config = {}) {
    let el;
    let controller = null;

    Solid.createEffect(() => {
      const text = typeof getText === 'function' ? getText() : getText;
      if (!el) return;
      controller?.stop();
      controller = TypeFlow.type(el, text, config);
    });

    Solid.onCleanup(() => {
      controller?.stop();
    });

    return (element) => {
      el = element;
    };
  };
}
