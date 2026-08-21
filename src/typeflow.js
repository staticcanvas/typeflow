/**
 * TypeFlow - A lightweight, interruptible, framework-agnostic typewriter library
 * @version 2.2.0
 * @license MIT
 *
 * Zero dependencies. Safe by default (no innerHTML string concatenation).
 * Vanilla-first, with optional adapter factories for React and Vue.
 */

// ============================================================
// Types
// ============================================================

export interface TypeFlowConfig {
  /** Ms per character. Default: 50 (type) / 25 (erase) */
  speed?: number;
  /** Ms before the animation starts. Default: 0 */
  delay?: number;
  /** +/- ms randomization per character for a more natural feel. Default: 0 */
  speedVariance?: number;
  /** Cursor character. Empty string disables it. Default: '|' */
  cursor?: string;
  /** Blink the cursor once typing completes. Default: true. (Ignored by erase.) */
  cursorBlink?: boolean;
  /** Interpret `text` as sanitized HTML instead of plain text. Default: false */
  html?: boolean;
  /** 'replace' clears the target first; 'append' types after existing content. Default: 'replace' */
  mode?: "replace" | "append";
  /** Extra tags allowed in html mode, merged with the safe default list. */
  allowedTags?: string[];
  /** Extra attributes allowed per tag, merged with the safe default map. */
  allowedAttributes?: Record<string, string[]>;
  /** Custom sanitizer. Receives raw HTML, must return safe HTML. Overrides the built-in sanitizer. */
  sanitizer?: (html: string) => string;
  /** Instantly complete instead of animating if the user prefers reduced motion. Default: true */
  respectReducedMotion?: boolean;
  /** aria-live region setting applied to the target for the duration of typing. */
  ariaLive?: "off" | "polite" | "assertive";
  /**
   * Erase-only: which direction/technique to erase with. Default: 'end'
   * - 'end'     backspace-style, removes from the right
   * - 'start'   removes from the left, tail stays until the end
   * - 'instant' clears immediately, no animation
   * - 'fade'    CSS opacity fade-out, then clears
   */
  eraseStyle?: "end" | "start" | "instant" | "fade";
  /** Erase-only: duration in ms for eraseStyle 'fade'. Default: 250 */
  duration?: number;
  /**
   * Erase-only: if the target was built with mode: 'append', preserve that
   * original prefix and only erase what was typed after it. Default: true
   */
  preserveBaseline?: boolean;
  onComplete?: (text: string) => void;
  onInterrupt?: () => void;
  onStart?: () => void;
}

export interface TypeFlowResult {
  /** false if stop() was called before the animation finished. */
  completed: boolean;
  text: string;
}

export interface TypeFlowController {
  /** Stop the animation immediately, leaving whatever has been typed/erased so far. */
  stop: () => void;
  /** Always resolves — check `completed` to distinguish finish vs. interruption. Never rejects on interrupt. */
  promise: Promise<TypeFlowResult>;
}

export type TypeFlowStep =
  | { kind: "type"; target?: HTMLElement | string; text: string; config?: TypeFlowConfig }
  | { kind: "erase"; target?: HTMLElement | string; config?: TypeFlowConfig }
  | { kind: "pause"; duration: number }
  | { kind: "call"; fn: () => void | Promise<void> };

export interface TypeFlowSequenceConfig {
  /** Number of times to run the sequence. Use Infinity to loop forever. Default: 1 */
  repeat?: number;
  /**
   * Default target used by any step that omits its own `target` — handy
   * when a sequence types/erases on a single element. Steps can still
   * override this individually for multi-element sequences.
   */
  target?: HTMLElement | string;
}

export interface TypeFlowRotateConfig {
  typeConfig?: TypeFlowConfig;
  eraseConfig?: TypeFlowConfig;
  /** Ms to hold each word before erasing it. Default: 1200 */
  holdDuration?: number;
  /** Ms to wait between erasing one word and typing the next. Default: 200 */
  pauseBetween?: number;
  /** Default: Infinity */
  repeat?: number;
}

// ============================================================
// Constants
// ============================================================

const TYPE_DEFAULTS: Required<
  Pick<
    TypeFlowConfig,
    | "speed" | "delay" | "speedVariance" | "cursor" | "cursorBlink"
    | "html" | "mode" | "respectReducedMotion"
  >
> = {
  speed: 50,
  delay: 0,
  speedVariance: 0,
  cursor: "|",
  cursorBlink: true,
  html: false,
  mode: "replace",
  respectReducedMotion: true,
};

const ERASE_DEFAULTS: TypeFlowConfig = {
  ...TYPE_DEFAULTS,
  speed: 25, // erasing reads better faster than typing by default
  cursorBlink: false,
  eraseStyle: "end",
  preserveBaseline: true,
};

const VOID_ELEMENTS = new Set([
  "br", "hr", "img", "input", "wbr", "area", "base",
  "col", "embed", "link", "meta", "source", "track",
]);

const DEFAULT_ALLOWED_TAGS = new Set([
  "b", "strong", "i", "em", "mark", "span", "small", "sub", "sup", "u", "br", "a", "code",
]);

const DEFAULT_ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  span: new Set(["class"]),
  mark: new Set(["class"]),
  "*": new Set(["class"]),
};

const CURSOR_SPACER = "\u00A0";
const CURSOR_BLINK_INTERVAL = 530;
const DEFAULT_FADE_DURATION = 250;

// ============================================================
// Sanitization (built-in, allowlist based — this only ever builds a
// detached, sanitized tree; nothing here touches the live DOM)
// ============================================================

function isSafeUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  return !v.startsWith("javascript:") && !v.startsWith("data:") && !v.startsWith("vbscript:");
}

function sanitizeElement(
  el: Element,
  allowedTags: Set<string>,
  allowedAttrs: Record<string, Set<string>>
): HTMLElement | null {
  const tag = el.tagName.toLowerCase();
  if (!allowedTags.has(tag)) return null;

  const clean = document.createElement(tag);
  const allowedForTag = allowedAttrs[tag] ?? new Set<string>();
  const allowedGlobal = allowedAttrs["*"] ?? new Set<string>();

  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    if (name.startsWith("on")) continue;
    if (!allowedForTag.has(name) && !allowedGlobal.has(name)) continue;
    if ((name === "href" || name === "src") && !isSafeUrl(attr.value)) continue;
    clean.setAttribute(name, attr.value);
  }

  if (tag === "a" && clean.getAttribute("target") === "_blank") {
    clean.setAttribute("rel", "noopener noreferrer");
  }

  return clean;
}

function buildSourceTree(
  input: string,
  plainText: boolean,
  allowedTags: Set<string>,
  allowedAttrs: Record<string, Set<string>>
): DocumentFragment {
  const fragment = document.createDocumentFragment();
  if (plainText) {
    fragment.appendChild(document.createTextNode(input));
    return fragment;
  }

  const template = document.createElement("template");
  template.innerHTML = input;

  const walk = (source: Node, target: Node) => {
    source.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        target.appendChild(document.createTextNode(child.textContent ?? ""));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const clean = sanitizeElement(child as Element, allowedTags, allowedAttrs);
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
// Reveal engines
// revealFragment: takes the first N characters (used for typing, and
//   for eraseStyle 'end' by counting DOWN — visually removes from the right)
// revealSuffixFragment: skips the first N characters (used for
//   eraseStyle 'start' — visually removes from the left)
// Both always produce structurally valid, fully-closed markup.
// ============================================================

function countTextLength(node: Node): number {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").length;
  let total = 0;
  node.childNodes.forEach((child) => (total += countTextLength(child)));
  return total;
}

function cloneReveal(node: Node, remaining: number): { clone: Node | null; remaining: number } {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    if (remaining <= 0) return { clone: null, remaining };
    if (text.length <= remaining) return { clone: document.createTextNode(text), remaining: remaining - text.length };
    return { clone: document.createTextNode(text.slice(0, remaining)), remaining: 0 };
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (VOID_ELEMENTS.has(tag)) {
      if (remaining < 0) return { clone: null, remaining };
      return { clone: el.cloneNode(false) as Element, remaining };
    }
    if (remaining <= 0) return { clone: null, remaining };
    const clone = el.cloneNode(false) as Element;
    let rem = remaining;
    let appended = false;
    node.childNodes.forEach((child) => {
      if (rem < 0) return;
      const result = cloneReveal(child, rem);
      if (result.clone) { clone.appendChild(result.clone); appended = true; }
      rem = result.remaining;
    });
    return { clone: appended ? clone : null, remaining: rem };
  }
  return { clone: null, remaining };
}

function revealFragment(source: DocumentFragment, charCount: number): DocumentFragment {
  const out = document.createDocumentFragment();
  let remaining = charCount;
  source.childNodes.forEach((child) => {
    if (remaining < 0) return;
    const result = cloneReveal(child, remaining);
    if (result.clone) out.appendChild(result.clone);
    remaining = result.remaining;
  });
  return out;
}

function cloneRevealSuffix(node: Node, skip: number): { clone: Node | null; skip: number } {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    if (skip <= 0) return { clone: document.createTextNode(text), skip: 0 };
    if (skip >= text.length) return { clone: null, skip: skip - text.length };
    return { clone: document.createTextNode(text.slice(skip)), skip: 0 };
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (VOID_ELEMENTS.has(tag)) {
      if (skip > 0) return { clone: null, skip };
      return { clone: el.cloneNode(false) as Element, skip };
    }
    const clone = el.cloneNode(false) as Element;
    let rem = skip;
    let appended = false;
    node.childNodes.forEach((child) => {
      const result = cloneRevealSuffix(child, rem);
      if (result.clone) { clone.appendChild(result.clone); appended = true; }
      rem = result.skip;
    });
    return { clone: appended ? clone : null, skip: rem };
  }
  return { clone: null, skip };
}

function revealSuffixFragment(source: DocumentFragment, skipCount: number): DocumentFragment {
  const out = document.createDocumentFragment();
  let skip = skipCount;
  source.childNodes.forEach((child) => {
    const result = cloneRevealSuffix(child, skip);
    if (result.clone) out.appendChild(result.clone);
    skip = result.skip;
  });
  return out;
}

type Renderer = (source: DocumentFragment, count: number) => DocumentFragment;

// ============================================================
// Core engine
// ============================================================

function resolveTarget(target: HTMLElement | string): HTMLElement {
  const el = resolveMaybeTarget(target);
  if (!el) throw new Error(`TypeFlow: target element not found (${String(target)})`);
  return el;
}

function resolveMaybeTarget(target: HTMLElement | string): HTMLElement | null {
  return typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

class TypeFlowEngine {
  private active = new Map<HTMLElement, TypeFlowController>();
  /** Tracks the "unerasable" prefix nodes for elements built with mode: 'append'. */
  private baselines = new WeakMap<HTMLElement, Node[]>();

  /** Shared stepping engine used by type() and the 'end'/'start' erase styles. */
  private animate(
    el: HTMLElement,
    sourceTree: DocumentFragment,
    totalChars: number,
    options: TypeFlowConfig,
    startCount: number,
    endCount: number,
    resultText: string,
    extra: { prefix?: Node[]; renderer?: Renderer; blinkOnFinish?: boolean } = {}
  ): TypeFlowController {
    this.active.get(el)?.stop();
    if (options.ariaLive) el.setAttribute("aria-live", options.ariaLive);

    const prefix = extra.prefix ?? [];
    const renderer = extra.renderer ?? revealFragment;
    const blinkOnFinish = extra.blinkOnFinish ?? false;
    const direction = endCount >= startCount ? 1 : -1;
    const speed = options.speed ?? TYPE_DEFAULTS.speed;

    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cursorInterval: ReturnType<typeof setInterval> | null = null;
    let resolveFn: ((r: TypeFlowResult) => void) | null = null;

    const clearTimers = () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (cursorInterval !== null) clearInterval(cursorInterval);
      timeoutId = null;
      cursorInterval = null;
    };

    const render = (charCount: number, cursorChar: string) => {
      el.replaceChildren(...prefix, renderer(sourceTree, charCount));
      if (cursorChar) el.appendChild(document.createTextNode(cursorChar));
    };

    const settle = (completed: boolean) => {
      if (settled) return;
      settled = true;
      clearTimers();
      this.active.delete(el);
      if (completed) {
        render(endCount, "");
        if (blinkOnFinish && options.cursor && options.cursorBlink) {
          let visible = true;
          cursorInterval = setInterval(() => {
            render(endCount, visible ? options.cursor! : CURSOR_SPACER);
            visible = !visible;
          }, CURSOR_BLINK_INTERVAL);
        }
        options.onComplete?.(resultText);
      } else {
        options.onInterrupt?.();
      }
      resolveFn?.({ completed, text: resultText });
    };

    const controller: TypeFlowController = {
      stop: () => settle(false),
      promise: new Promise<TypeFlowResult>((resolve) => { resolveFn = resolve; }),
    };
    this.active.set(el, controller);

    if (options.respectReducedMotion && prefersReducedMotion()) {
      settle(true);
      return controller;
    }

    const step = (count: number) => {
      render(count, options.cursor ?? "");
      if (count === endCount) { settle(true); return; }
      const jitter = options.speedVariance ? (Math.random() * 2 - 1) * options.speedVariance : 0;
      const delayMs = Math.max(0, speed + jitter);
      timeoutId = setTimeout(() => step(count + direction), delayMs);
    };

    options.onStart?.();
    timeoutId = setTimeout(() => step(startCount), options.delay ?? 0);
    return controller;
  }

  /** CSS opacity fade-out, used by eraseStyle: 'fade'. Bypasses the char-reveal engine entirely. */
  private eraseFade(
    el: HTMLElement,
    erasableLive: Node[],
    baseline: Node[],
    options: TypeFlowConfig
  ): TypeFlowController {
    this.active.get(el)?.stop();

    const wrapper = document.createElement("span");
    erasableLive.forEach((n) => wrapper.appendChild(n));
    el.replaceChildren(...baseline, wrapper);

    const duration = options.duration ?? DEFAULT_FADE_DURATION;
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let resolveFn: ((r: TypeFlowResult) => void) | null = null;

    const settle = (completed: boolean) => {
      if (settled) return;
      settled = true;
      if (timeoutId !== null) clearTimeout(timeoutId);
      this.active.delete(el);
      if (completed) {
        el.replaceChildren(...baseline);
        options.onComplete?.("");
      } else {
        options.onInterrupt?.();
      }
      resolveFn?.({ completed, text: "" });
    };

    const controller: TypeFlowController = {
      stop: () => settle(false),
      promise: new Promise<TypeFlowResult>((resolve) => { resolveFn = resolve; }),
    };
    this.active.set(el, controller);

    if (options.respectReducedMotion && prefersReducedMotion()) {
      settle(true);
      return controller;
    }

    requestAnimationFrame(() => {
      wrapper.style.transition = `opacity ${duration}ms ease`;
      wrapper.style.opacity = "0";
    });
    timeoutId = setTimeout(() => settle(true), duration);
    return controller;
  }

  private instantClear(el: HTMLElement, baseline: Node[], options: TypeFlowConfig): TypeFlowController {
    this.active.get(el)?.stop();
    el.replaceChildren(...baseline);
    options.onComplete?.("");
    return { stop: () => {}, promise: Promise.resolve({ completed: true, text: "" }) };
  }

  type(target: HTMLElement | string, text: string, config: TypeFlowConfig = {}): TypeFlowController {
    const el = resolveTarget(target);
    const options: TypeFlowConfig = { ...TYPE_DEFAULTS, ...config };
    const allowedTags = new Set([...DEFAULT_ALLOWED_TAGS, ...(options.allowedTags ?? [])]);
    const allowedAttrs: Record<string, Set<string>> = { ...DEFAULT_ALLOWED_ATTRS };
    if (options.allowedAttributes) {
      for (const [tag, attrs] of Object.entries(options.allowedAttributes)) {
        allowedAttrs[tag] = new Set([...(allowedAttrs[tag] ?? []), ...attrs]);
      }
    }

    let sourceText = String(text);
    if (options.html && options.sanitizer) sourceText = options.sanitizer(sourceText);
    const sourceTree = buildSourceTree(sourceText, !options.html, allowedTags, allowedAttrs);
    const totalChars = countTextLength(sourceTree);

    const prefix = options.mode === "append" ? Array.from(el.childNodes) : [];
    if (options.mode === "append") this.baselines.set(el, prefix);
    else this.baselines.delete(el);

    return this.animate(el, sourceTree, totalChars, options, 0, totalChars, sourceText, {
      prefix,
      blinkOnFinish: true,
    });
  }

  /** Erases the target's current content. See TypeFlowConfig.eraseStyle for animation options. */
  erase(target: HTMLElement | string, config: TypeFlowConfig = {}): TypeFlowController {
    const el = resolveTarget(target);
    const options: TypeFlowConfig = { ...ERASE_DEFAULTS, ...config };

    const baseline = options.preserveBaseline ? this.baselines.get(el) ?? [] : [];
    const allChildren = Array.from(el.childNodes);
    const erasableLive = baseline.length ? allChildren.filter((n) => !baseline.includes(n)) : allChildren;

    if (options.eraseStyle === "instant") return this.instantClear(el, baseline, options);
    if (options.eraseStyle === "fade") return this.eraseFade(el, erasableLive, baseline, options);

    const sourceTree = document.createDocumentFragment();
    erasableLive.forEach((n) => sourceTree.appendChild(n.cloneNode(true)));
    const totalChars = countTextLength(sourceTree);

    if (options.eraseStyle === "start") {
      return this.animate(el, sourceTree, totalChars, options, 0, totalChars, "", {
        prefix: baseline,
        renderer: revealSuffixFragment,
      });
    }

    // 'end' (default)
    return this.animate(el, sourceTree, totalChars, options, totalChars, 0, "", { prefix: baseline });
  }

  /**
   * Runs type / erase / pause / call steps in order. Stopping the returned
   * controller stops the current step and cancels the rest. Never rejects.
   */
  sequence(steps: TypeFlowStep[], seqConfig: TypeFlowSequenceConfig = {}): TypeFlowController {
    let isInterrupted = false;
    let currentSub: TypeFlowController | null = null;
    let cancelPause: (() => void) | null = null;

    const resolveStepTarget = (step: { target?: HTMLElement | string }): HTMLElement | string => {
      const target = step.target ?? seqConfig.target;
      if (!target) {
        throw new Error(
          "TypeFlow: a sequence step is missing a target, and no default `target` was set on the sequence config."
        );
      }
      return target;
    };

    const controller: TypeFlowController = {
      stop: () => {
        if (isInterrupted) return;
        isInterrupted = true;
        currentSub?.stop();
        cancelPause?.();
      },
      promise: null as unknown as Promise<TypeFlowResult>,
    };

    const runOnce = async (): Promise<boolean> => {
      for (const step of steps) {
        if (isInterrupted) return false;

        if (step.kind === "type") {
          currentSub = this.type(resolveStepTarget(step), step.text, step.config);
          if (!(await currentSub.promise).completed) return false;
        } else if (step.kind === "erase") {
          currentSub = this.erase(resolveStepTarget(step), step.config);
          if (!(await currentSub.promise).completed) return false;
        } else if (step.kind === "pause") {
          const finishedNaturally = await new Promise<boolean>((resolve) => {
            const id = setTimeout(() => resolve(true), step.duration);
            cancelPause = () => { clearTimeout(id); resolve(false); };
          });
          cancelPause = null;
          if (!finishedNaturally) return false;
        } else if (step.kind === "call") {
          await step.fn();
        }

        if (isInterrupted) return false;
      }
      return true;
    };

    controller.promise = (async (): Promise<TypeFlowResult> => {
      const repeat = seqConfig.repeat ?? 1;
      for (let i = 0; repeat === Infinity || i < repeat; i++) {
        if (!(await runOnce())) return { completed: false, text: "" };
      }
      return { completed: true, text: "" };
    })();

    return controller;
  }

  /**
   * QoL shortcut for the extremely common "rotating text" pattern —
   * builds and runs a type/pause/erase/pause sequence for each word.
   *
   *   TypeFlow.rotate('#hero span', ['designers.', 'developers.', 'you.']);
   */
  rotate(target: HTMLElement | string, words: string[], config: TypeFlowRotateConfig = {}): TypeFlowController {
    const {
      typeConfig = {},
      eraseConfig = {},
      holdDuration = 1200,
      pauseBetween = 200,
      repeat = Infinity,
    } = config;

    const steps: TypeFlowStep[] = [];
    words.forEach((word) => {
      steps.push({ kind: "type", target, text: word, config: typeConfig });
      steps.push({ kind: "pause", duration: holdDuration });
      steps.push({ kind: "erase", target, config: eraseConfig });
      steps.push({ kind: "pause", duration: pauseBetween });
    });

    return this.sequence(steps, { repeat });
  }

  /**
   * QoL shortcut for animating elements as they're added to the DOM later
   * (e.g. search results, infinite scroll, streamed content) — wraps the
   * MutationObserver boilerplate that pattern usually needs.
   *
   *   const watcher = TypeFlow.watch('#results', '.result-title', (el) => {
   *     TypeFlow.type(el, el.textContent ?? '', { speed: 15, cursor: '' });
   *   });
   *   // later: watcher.disconnect();
   */
  watch(
    container: HTMLElement | string,
    childSelector: string,
    callback: (el: HTMLElement) => void
  ): { disconnect: () => void } {
    const root = resolveTarget(container);
    root.querySelectorAll<HTMLElement>(childSelector).forEach(callback);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = node as HTMLElement;
          if (el.matches(childSelector)) callback(el);
          el.querySelectorAll<HTMLElement>(childSelector).forEach(callback);
        });
      }
    });

    observer.observe(root, { childList: true, subtree: true });
    return { disconnect: () => observer.disconnect() };
  }

  stop(target: HTMLElement | string): void {
    const el = resolveMaybeTarget(target);
    if (!el) return;
    this.active.get(el)?.stop();
  }

  stopAll(): void {
    Array.from(this.active.values()).forEach((c) => c.stop());
  }

  isTyping(target: HTMLElement | string): boolean {
    const el = resolveMaybeTarget(target);
    return !!el && this.active.has(el);
  }
}

// ============================================================
// Vanilla public API (singleton)
// ============================================================

export const TypeFlow = new TypeFlowEngine();
export default TypeFlow;

export const seq = {
  type: (target: HTMLElement | string, text: string, config?: TypeFlowConfig): TypeFlowStep => ({ kind: "type", target, text, config }),
  erase: (target: HTMLElement | string, config?: TypeFlowConfig): TypeFlowStep => ({ kind: "erase", target, config }),
  pause: (duration: number): TypeFlowStep => ({ kind: "pause", duration }),
  call: (fn: () => void | Promise<void>): TypeFlowStep => ({ kind: "call", fn }),
};

if (typeof window !== "undefined") {
  (window as unknown as { TypeFlow: TypeFlowEngine; TypeFlowSeq: typeof seq }).TypeFlow = TypeFlow;
  (window as unknown as { TypeFlow: TypeFlowEngine; TypeFlowSeq: typeof seq }).TypeFlowSeq = seq;
}

// ============================================================
// React adapter (no hard dependency — pass your React import in)
// ============================================================

interface ReactLike {
  useRef: <T>(initial: T | null) => { current: T | null };
  useEffect: (fn: () => void | (() => void), deps: unknown[]) => void;
}

export function createTypeFlowReact(React: ReactLike) {
  return function useTypeFlow<T extends HTMLElement = HTMLElement>(text: string, config: TypeFlowConfig = {}) {
    const ref = React.useRef<T>(null);
    React.useEffect(() => {
      if (!ref.current) return;
      const controller = TypeFlow.type(ref.current, text, config);
      return () => controller.stop();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text]);
    return ref;
  };
}

export function createTypeFlowSequenceReact(React: ReactLike) {
  return function useTypeFlowSequence(buildSteps: () => TypeFlowStep[], deps: unknown[]) {
    React.useEffect(() => {
      const controller = TypeFlow.sequence(buildSteps());
      return () => controller.stop();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
  };
}

// ============================================================
// Vue adapter (no hard dependency — pass your Vue import in)
// ============================================================

interface VueLike {
  ref: <T>(initial: T | null) => { value: T | null };
  watch: (source: unknown, cb: () => void, opts?: { immediate?: boolean }) => void;
  onBeforeUnmount: (cb: () => void) => void;
}

export function createTypeFlowVue(Vue: VueLike) {
  return function useTypeFlow<T extends HTMLElement = HTMLElement>(getText: () => string, config: TypeFlowConfig = {}) {
    const el = Vue.ref<T>(null);
    let controller: TypeFlowController | null = null;
    Vue.watch(getText, () => {
      if (!el.value) return;
      controller = TypeFlow.type(el.value, getText(), config);
    }, { immediate: true });
    Vue.onBeforeUnmount(() => controller?.stop());
    return el;
  };
}

export function createTypeFlowSequenceVue(Vue: VueLike) {
  return function useTypeFlowSequence(buildSteps: () => TypeFlowStep[]) {
    let controller: TypeFlowController | null = null;
    const run = () => {
      controller?.stop();
      controller = TypeFlow.sequence(buildSteps());
    };
    Vue.onBeforeUnmount(() => controller?.stop());
    return run;
  };
}

/* ============================================
   USAGE EXAMPLES
   ============================================

// Independent speed control for typing vs erasing
TypeFlow.type('#hero', 'Hello there', { speed: 60 });
TypeFlow.erase('#hero', { speed: 15, eraseStyle: 'end' });

// Erase styles
TypeFlow.erase('#hero', { eraseStyle: 'start' });    // erodes from the left
TypeFlow.erase('#hero', { eraseStyle: 'fade' });     // opacity fade, then clear
TypeFlow.erase('#hero', { eraseStyle: 'instant' });  // no animation

// Rotating word pattern — one call instead of hand-built sequence
TypeFlow.rotate('#hero-word', ['designers.', 'developers.', 'you.'], {
  typeConfig: { speed: 40 },
  eraseConfig: { eraseStyle: 'start', speed: 15 },
  holdDuration: 1000,
});

// Append + erase only what was appended (baseline preserved)
TypeFlow.type('#log', 'Status: ', { mode: 'replace' });
TypeFlow.type('#log', 'Connecting...', { mode: 'append' });
TypeFlow.erase('#log'); // only erases "Connecting...", "Status: " stays

// Dynamically-added elements — no manual MutationObserver needed
const watcher = TypeFlow.watch('#results', '.result-title', (el) => {
  const text = el.textContent ?? '';
  el.textContent = '';
  TypeFlow.type(el, text, { speed: 15, cursor: '' });
});
// watcher.disconnect() when the list is torn down

// Promise never rejects on interrupt — check `completed`
const controller = TypeFlow.type('#output', 'Long text...', { speed: 40 });
controller.promise.then(({ completed, text }) => {
  console.log(completed ? 'finished:' : 'stopped early:', text);
});
setTimeout(() => controller.stop(), 300);

// Sequence with a callback in between
TypeFlow.sequence([
  seq.type('#step1', 'Step one complete.'),
  seq.pause(500),
  seq.call(() => console.log('moving to step two')),
  seq.type('#step2', 'Step two complete.'),
]);
*/
