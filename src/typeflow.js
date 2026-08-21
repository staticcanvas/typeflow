/**
 * TypeFlow - A lightweight, interruptible, framework-agnostic typewriter library
 * @version 2.1.0
 * @license MIT
 *
 * Zero dependencies. Safe by default (no innerHTML string concatenation).
 * Vanilla-first, with optional adapter factories for React and Vue that
 * take the framework as an argument instead of importing it — so this
 * file has zero hard dependencies on any framework.
 */

// ============================================================
// Types
// ============================================================

export interface TypeFlowConfig {
  /** Ms per character. Default: 50 */
  speed?: number;
  /** Ms before typing starts. Default: 0 */
  delay?: number;
  /** +/- ms randomization per character for a more natural feel. Default: 0 */
  speedVariance?: number;
  /** Cursor character. Empty string disables it. Default: '|' */
  cursor?: string;
  /** Blink the cursor once typing completes. Default: true */
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
  /** aria-live region setting applied to the target for the duration of typing. Default: undefined (untouched) */
  ariaLive?: "off" | "polite" | "assertive";
  onComplete?: (text: string) => void;
  onInterrupt?: () => void;
  onStart?: () => void;
}

export interface TypeFlowController {
  /** Stop the animation immediately, leaving whatever has been typed/erased so far. */
  stop: () => void;
  /** Resolves on completion, rejects if interrupted. */
  promise: Promise<string>;
}

/** A single step in a sequence. Build with the `seq` helpers below, or as plain objects. */
export type TypeFlowStep =
  | { kind: "type"; target: HTMLElement | string; text: string; config?: TypeFlowConfig }
  | { kind: "erase"; target: HTMLElement | string; config?: TypeFlowConfig }
  | { kind: "pause"; duration: number }
  | { kind: "call"; fn: () => void | Promise<void> };

export interface TypeFlowSequenceConfig {
  /** Number of times to run the sequence. Use Infinity to loop forever. Default: 1 */
  repeat?: number;
}

// ============================================================
// Constants
// ============================================================

const DEFAULTS: Required<
  Pick<
    TypeFlowConfig,
    | "speed"
    | "delay"
    | "speedVariance"
    | "cursor"
    | "cursorBlink"
    | "html"
    | "mode"
    | "respectReducedMotion"
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

const VOID_ELEMENTS = new Set([
  "br",
  "hr",
  "img",
  "input",
  "wbr",
  "area",
  "base",
  "col",
  "embed",
  "link",
  "meta",
  "source",
  "track",
]);

const DEFAULT_ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "mark",
  "span",
  "small",
  "sub",
  "sup",
  "u",
  "br",
  "a",
  "code",
]);

const DEFAULT_ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  span: new Set(["class"]),
  mark: new Set(["class"]),
  "*": new Set(["class"]),
};

const CURSOR_SPACER = "\u00A0";
const CURSOR_BLINK_INTERVAL = 530;

// ============================================================
// Sanitization (built-in, allowlist based — this only ever builds a
// detached, sanitized tree; nothing here touches the live DOM)
// ============================================================

function isSafeUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  return (
    !v.startsWith("javascript:") &&
    !v.startsWith("data:") &&
    !v.startsWith("vbscript:")
  );
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
    if (name.startsWith("on")) continue; // never allow event handlers
    if (!allowedForTag.has(name) && !allowedGlobal.has(name)) continue;
    if ((name === "href" || name === "src") && !isSafeUrl(attr.value)) continue;
    clean.setAttribute(name, attr.value);
  }

  if (tag === "a" && clean.getAttribute("target") === "_blank") {
    clean.setAttribute("rel", "noopener noreferrer");
  }

  return clean;
}

/** Parses a string into a detached, sanitized DOM fragment. */
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
          walk(child, target); // unknown tag: keep text content, drop the wrapper
        }
      }
    });
  };

  walk(template.content, fragment);
  return fragment;
}

// ============================================================
// Reveal engine — clones a subset of a source tree, always producing
// structurally valid (fully closed) markup at every step.
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
    if (text.length <= remaining) {
      return { clone: document.createTextNode(text), remaining: remaining - text.length };
    }
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
      if (result.clone) {
        clone.appendChild(result.clone);
        appended = true;
      }
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

// ============================================================
// Core engine
// ============================================================

function resolveTarget(target: HTMLElement | string): HTMLElement {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
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
  /** Element identity is used directly as the map key — no DOM property hacks. */
  private active = new Map<HTMLElement, TypeFlowController>();

  /**
   * Runs a reveal animation on `el` from `startCount` to `endCount` characters
   * (increasing = typing, decreasing = erasing). Shared by type() and erase().
   */
  private animate(
    el: HTMLElement,
    sourceTree: DocumentFragment,
    totalChars: number,
    options: TypeFlowConfig & typeof DEFAULTS,
    startCount: number,
    endCount: number,
    resultText: string,
    prefix: Node[] = []
  ): TypeFlowController {
    this.active.get(el)?.stop();

    if (options.ariaLive) el.setAttribute("aria-live", options.ariaLive);

    const direction = endCount >= startCount ? 1 : -1;
    let isInterrupted = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cursorInterval: ReturnType<typeof setInterval> | null = null;

    const clearTimers = () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (cursorInterval !== null) clearInterval(cursorInterval);
      timeoutId = null;
      cursorInterval = null;
    };

    const render = (charCount: number, cursorChar: string) => {
      el.replaceChildren(...prefix, revealFragment(sourceTree, charCount));
      if (cursorChar) el.appendChild(document.createTextNode(cursorChar));
    };

    const controller: TypeFlowController = {
      stop: () => {
        if (isInterrupted) return;
        isInterrupted = true;
        clearTimers();
        this.active.delete(el);
        options.onInterrupt?.();
      },
      promise: null as unknown as Promise<string>,
    };

    this.active.set(el, controller);
    const instant = options.respectReducedMotion && prefersReducedMotion();

    controller.promise = new Promise<string>((resolve, reject) => {
      const finish = () => {
        render(endCount, "");
        if (direction === 1 && options.cursor && options.cursorBlink) {
          let visible = true;
          cursorInterval = setInterval(() => {
            render(endCount, visible ? options.cursor! : CURSOR_SPACER);
            visible = !visible;
          }, CURSOR_BLINK_INTERVAL);
        }
        this.active.delete(el);
        options.onComplete?.(resultText);
        resolve(resultText);
      };

      if (instant) {
        finish();
        return;
      }

      const step = (count: number) => {
        if (isInterrupted) {
          reject(new Error("TypeFlow: animation interrupted"));
          return;
        }
        render(count, direction === 1 ? options.cursor ?? "" : "");
        if (count === endCount) {
          finish();
          return;
        }
        const jitter = options.speedVariance ? (Math.random() * 2 - 1) * options.speedVariance : 0;
        const delayMs = Math.max(0, options.speed! + jitter);
        timeoutId = setTimeout(() => step(count + direction), delayMs);
      };

      options.onStart?.();
      timeoutId = setTimeout(() => step(startCount), options.delay);
    });

    return controller;
  }

  type(target: HTMLElement | string, text: string, config: TypeFlowConfig = {}): TypeFlowController {
    const el = resolveTarget(target);
    const options: TypeFlowConfig & typeof DEFAULTS = { ...DEFAULTS, ...config };
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

    return this.animate(el, sourceTree, totalChars, options, 0, totalChars, sourceText, prefix);
  }

  /** Reverses (backspaces) the target's current content. */
  erase(target: HTMLElement | string, config: TypeFlowConfig = {}): TypeFlowController {
    const el = resolveTarget(target);
    const options: TypeFlowConfig & typeof DEFAULTS = { ...DEFAULTS, cursorBlink: false, ...config };

    const sourceTree = document.createDocumentFragment();
    Array.from(el.childNodes).forEach((n) => sourceTree.appendChild(n.cloneNode(true)));
    const totalChars = countTextLength(sourceTree);

    return this.animate(el, sourceTree, totalChars, options, totalChars, 0, "");
  }

  /**
   * Runs a series of type / erase / pause / call steps in order.
   * Stopping the returned controller stops the current step and cancels the rest.
   */
  sequence(steps: TypeFlowStep[], seqConfig: TypeFlowSequenceConfig = {}): TypeFlowController {
    let isInterrupted = false;
    let currentSub: TypeFlowController | null = null;
    let cancelPause: (() => void) | null = null;

    const controller: TypeFlowController = {
      stop: () => {
        if (isInterrupted) return;
        isInterrupted = true;
        currentSub?.stop();
        cancelPause?.();
      },
      promise: null as unknown as Promise<string>,
    };

    const runOnce = async () => {
      for (const step of steps) {
        if (isInterrupted) throw new Error("TypeFlow: sequence interrupted");

        switch (step.kind) {
          case "type":
            currentSub = this.type(step.target, step.text, step.config);
            await currentSub.promise;
            break;
          case "erase":
            currentSub = this.erase(step.target, step.config);
            await currentSub.promise;
            break;
          case "pause":
            await new Promise<void>((resolve) => {
              const id = setTimeout(resolve, step.duration);
              cancelPause = () => {
                clearTimeout(id);
                resolve();
              };
            });
            cancelPause = null;
            break;
          case "call":
            await step.fn();
            break;
        }

        if (isInterrupted) throw new Error("TypeFlow: sequence interrupted");
      }
    };

    controller.promise = (async () => {
      const repeat = seqConfig.repeat ?? 1;
      for (let i = 0; repeat === Infinity || i < repeat; i++) {
        await runOnce();
      }
      return "";
    })();

    return controller;
  }

  stop(target: HTMLElement | string): void {
    const el = resolveMaybeTarget(target);
    if (!el) return;
    this.active.get(el)?.stop();
  }

  stopAll(): void {
    Array.from(this.active.values()).forEach((c) => c.stop()); // snapshot: stop() mutates the map
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

/** Ergonomic builders for TypeFlow.sequence() steps. */
export const seq = {
  type: (target: HTMLElement | string, text: string, config?: TypeFlowConfig): TypeFlowStep => ({
    kind: "type",
    target,
    text,
    config,
  }),
  erase: (target: HTMLElement | string, config?: TypeFlowConfig): TypeFlowStep => ({
    kind: "erase",
    target,
    config,
  }),
  pause: (duration: number): TypeFlowStep => ({ kind: "pause", duration }),
  call: (fn: () => void | Promise<void>): TypeFlowStep => ({ kind: "call", fn }),
};

// Attach to window for non-module <script> usage
if (typeof window !== "undefined") {
  (window as unknown as { TypeFlow: TypeFlowEngine; TypeFlowSeq: typeof seq }).TypeFlow = TypeFlow;
  (window as unknown as { TypeFlow: TypeFlowEngine; TypeFlowSeq: typeof seq }).TypeFlowSeq = seq;
}

// ============================================================
// React adapter (no hard dependency — pass your React import in)
//
//   import * as React from "react";
//   import { createTypeFlowReact } from "./typeflow";
//   const useTypeFlow = createTypeFlowReact(React);
//
//   function Title({ text }: { text: string }) {
//     const ref = useTypeFlow(text, { speed: 30, html: true });
//     return <h3 ref={ref} />; // must have no JSX children
//   }
// ============================================================

interface ReactLike {
  useRef: <T>(initial: T | null) => { current: T | null };
  useEffect: (fn: () => void | (() => void), deps: unknown[]) => void;
}

export function createTypeFlowReact(React: ReactLike) {
  return function useTypeFlow<T extends HTMLElement = HTMLElement>(
    text: string,
    config: TypeFlowConfig = {}
  ) {
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

/**
 * React adapter for sequences. Pass a factory since steps usually reference
 * refs that only exist after mount.
 *
 *   const useTypeFlowSequence = createTypeFlowSequenceReact(React);
 *   useTypeFlowSequence(() => [seq.type(ref.current!, "Hi"), seq.pause(500)], []);
 */
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
//
//   import * as Vue from "vue";
//   import { createTypeFlowVue } from "./typeflow";
//   const useTypeFlow = createTypeFlowVue(Vue);
//
//   const el = useTypeFlow(() => props.text, { speed: 30 });
//   // <h3 :ref="el"></h3>
// ============================================================

interface VueLike {
  ref: <T>(initial: T | null) => { value: T | null };
  watch: (source: unknown, cb: () => void, opts?: { immediate?: boolean }) => void;
  onBeforeUnmount: (cb: () => void) => void;
}

export function createTypeFlowVue(Vue: VueLike) {
  return function useTypeFlow<T extends HTMLElement = HTMLElement>(
    getText: () => string,
    config: TypeFlowConfig = {}
  ) {
    const el = Vue.ref<T>(null);
    let controller: TypeFlowController | null = null;

    Vue.watch(
      getText,
      () => {
        if (!el.value) return;
        controller = TypeFlow.type(el.value, getText(), config);
      },
      { immediate: true }
    );

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
   VANILLA USAGE EXAMPLES
   ============================================

// Plain text
TypeFlow.type('#output', 'Hello, World!', { speed: 50 });

// Safe HTML mode — <mark>/<strong>/<a> etc. survive, scripts/handlers don't
TypeFlow.type('#result', 'Found <mark>TypeFlow</mark> in <strong>docs</strong>', {
  speed: 20,
  html: true,
  cursor: ''
});

// Erase existing content
TypeFlow.erase('#output', { speed: 20 });

// Sequence: type, pause, erase, type again — on repeat forever
import { seq } from './typeflow';

TypeFlow.sequence([
  seq.type('#hero', 'Building interfaces...', { speed: 40 }),
  seq.pause(1200),
  seq.erase('#hero', { speed: 15 }),
  seq.type('#hero', 'Shipping products.', { speed: 40 }),
  seq.pause(1200),
  seq.erase('#hero', { speed: 15 }),
], { repeat: Infinity });

// Sequence across multiple elements with a callback in between
TypeFlow.sequence([
  seq.type('#step1', 'Step one complete.'),
  seq.pause(500),
  seq.call(() => console.log('moving to step two')),
  seq.type('#step2', 'Step two complete.'),
]);

// Control + promise
const controller = TypeFlow.type('#output', 'Long text...', { speed: 40 });
controller.promise.then(() => console.log('done')).catch(() => console.log('interrupted'));
setTimeout(() => controller.stop(), 1500);

TypeFlow.stopAll();
*/
