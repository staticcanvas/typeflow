/**
 * TypeFlow - A lightweight, interruptible, framework-agnostic typewriter library
 * @version 2.3.0
 * @license MIT
 *
 * Zero dependencies. Safe by default (no innerHTML string concatenation).
 * Vanilla-first, with Intl.Segmenter support, multi-style reveals, and adapters for React and Vue.
 */

// ============================================================
// Types
// ============================================================

export interface TypeFlowConfig {
  /** Ms per character/word. Default: 50 (type) / 25 (erase) */
  speed?: number;
  /** Ms before the animation starts. Default: 0 */
  delay?: number;
  /** +/- ms randomization per character/word for a more natural feel. Default: 0 */
  speedVariance?: number;
  /** Automatically add micro-pauses at punctuation (. , ! ?) and word boundaries. Default: false */
  naturalCadence?: boolean;
  /** Granularity of typing and erasing. Default: 'grapheme' */
  granularity?: "grapheme" | "word";
  /** Cursor character. Empty string disables it. Default: '|' */
  cursor?: string;
  /** Blink the cursor once typing completes. Default: true. (Ignored by erase.) */
  cursorBlink?: boolean;
  /** Interpret `text` as sanitized HTML instead of plain text. Default: false */
  html?: boolean;
  /** 'replace' clears the target first; 'append' types after existing content. Default: 'replace' */
  mode?: "replace" | "append";
  /** Reveal style for typing: 'char' (standard), 'word', 'scramble' (matrix decrypt). Default: 'char' */
  typeStyle?: "char" | "word" | "scramble";
  /** Custom scramble glyph characters when typeStyle or eraseStyle is 'scramble'. */
  scrambleGlyphs?: string;
  /** Number of scramble iterations per unit before settling. Default: 2 */
  scrambleRounds?: number;
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
   * - 'end'      backspace-style, removes from the right
   * - 'start'    removes from the left, tail stays until the end
   * - 'scramble' scrambles characters into glyphs before clearing
   * - 'instant'  clears immediately, no animation
   * - 'fade'     CSS opacity fade-out, then clears
   */
  eraseStyle?: "end" | "start" | "scramble" | "instant" | "fade";
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
  | { kind: "visible"; target?: HTMLElement | string; threshold?: number }
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
    | "speed" | "delay" | "speedVariance" | "naturalCadence" | "granularity"
    | "cursor" | "cursorBlink" | "html" | "mode" | "typeStyle"
    | "scrambleGlyphs" | "scrambleRounds" | "respectReducedMotion"
  >
> = {
  speed: 50,
  delay: 0,
  speedVariance: 0,
  naturalCadence: false,
  granularity: "grapheme",
  cursor: "|",
  cursorBlink: true,
  html: false,
  mode: "replace",
  typeStyle: "char",
  scrambleGlyphs: "!<>-_\\/[]{}—=+*^?#________",
  scrambleRounds: 2,
  respectReducedMotion: true,
};

const ERASE_DEFAULTS: TypeFlowConfig = {
  ...TYPE_DEFAULTS,
  speed: 25,
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
// Intl.Segmenter Helper & Unit Slicing
// ============================================================

function segmentText(text: string, granularity: "grapheme" | "word" = "grapheme"): string[] {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  if (granularity === "word") {
    const matches = text.match(/\s+|\S+/g);
    return matches ? matches : [text];
  }
  return Array.from(text);
}

function getRandomGlyph(glyphs: string): string {
  return glyphs[Math.floor(Math.random() * glyphs.length)];
}

// ============================================================
// Sanitization
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
// Reveal Engines
// ============================================================

function countTextUnits(node: Node, granularity: "grapheme" | "word" = "grapheme"): number {
  if (node.nodeType === Node.TEXT_NODE) {
    return segmentText(node.textContent ?? "", granularity).length;
  }
  let total = 0;
  node.childNodes.forEach((child) => (total += countTextUnits(child, granularity)));
  return total;
}

function cloneReveal(
  node: Node,
  remaining: number,
  granularity: "grapheme" | "word" = "grapheme",
  scrambleOpts?: { active: boolean; glyphs: string }
): { clone: Node | null; remaining: number } {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    const units = segmentText(text, granularity);
    if (remaining <= 0) return { clone: null, remaining };
    if (units.length <= remaining) {
      return { clone: document.createTextNode(text), remaining: remaining - units.length };
    }
    let sliced = units.slice(0, remaining).join("");
    if (scrambleOpts?.active && remaining > 0 && units[remaining - 1]?.trim()) {
      sliced = units.slice(0, remaining - 1).join("") + getRandomGlyph(scrambleOpts.glyphs);
    }
    return { clone: document.createTextNode(sliced), remaining: 0 };
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
      const result = cloneReveal(child, rem, granularity, scrambleOpts);
      if (result.clone) { clone.appendChild(result.clone); appended = true; }
      rem = result.remaining;
    });
    return { clone: appended ? clone : null, remaining: rem };
  }
  return { clone: null, remaining };
}

function revealFragment(
  source: DocumentFragment,
  unitCount: number,
  granularity: "grapheme" | "word" = "grapheme",
  scrambleOpts?: { active: boolean; glyphs: string }
): DocumentFragment {
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

function cloneRevealSuffix(
  node: Node,
  skip: number,
  granularity: "grapheme" | "word" = "grapheme"
): { clone: Node | null; skip: number } {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    const units = segmentText(text, granularity);
    if (skip <= 0) return { clone: document.createTextNode(text), skip: 0 };
    if (skip >= units.length) return { clone: null, skip: skip - units.length };
    return { clone: document.createTextNode(units.slice(skip).join("")), skip: 0 };
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
      const result = cloneRevealSuffix(child, rem, granularity);
      if (result.clone) { clone.appendChild(result.clone); appended = true; }
      rem = result.skip;
    });
    return { clone: appended ? clone : null, skip: rem };
  }
  return { clone: null, skip };
}

function revealSuffixFragment(
  source: DocumentFragment,
  skipCount: number,
  granularity: "grapheme" | "word" = "grapheme"
): DocumentFragment {
  const out = document.createDocumentFragment();
  let skip = skipCount;
  source.childNodes.forEach((child) => {
    const result = cloneRevealSuffix(child, skip, granularity);
    if (result.clone) out.appendChild(result.clone);
    skip = result.skip;
  });
  return out;
}

type Renderer = (
  source: DocumentFragment,
  count: number,
  granularity: "grapheme" | "word",
  scrambleOpts?: { active: boolean; glyphs: string }
) => DocumentFragment;

// ============================================================
// Core Engine
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

function calculateCadencePause(text: string, count: number): number {
  if (count <= 0 || count > text.length) return 0;
  const char = text[count - 1];
  if (char === "." || char === "!" || char === "?") return 220;
  if (char === "," || char === ";" || char === ":") return 110;
  if (char === " ") return 40;
  return 0;
}

class TypeFlowEngine {
  private active = new Map<HTMLElement, TypeFlowController>();
  private baselines = new WeakMap<HTMLElement, Node[]>();

  private animate(
    el: HTMLElement,
    sourceTree: DocumentFragment,
    totalUnits: number,
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
    const granularity = options.granularity ?? TYPE_DEFAULTS.granularity;
    const isScramble = options.typeStyle === "scramble" || options.eraseStyle === "scramble";
    const scrambleGlyphs = options.scrambleGlyphs ?? TYPE_DEFAULTS.scrambleGlyphs;

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

    const render = (unitCount: number, cursorChar: string, scrambleActive = false) => {
      el.replaceChildren(
        ...prefix,
        renderer(sourceTree, unitCount, granularity, { active: scrambleActive, glyphs: scrambleGlyphs })
      );
      if (cursorChar) el.appendChild(document.createTextNode(cursorChar));
    };

    const settle = (completed: boolean) => {
      if (settled) return;
      settled = true;
      clearTimers();
      this.active.delete(el);
      if (completed) {
        render(endCount, "", false);
        if (blinkOnFinish && options.cursor && options.cursorBlink) {
          let visible = true;
          cursorInterval = setInterval(() => {
            render(endCount, visible ? options.cursor! : CURSOR_SPACER, false);
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

    let scrambleStep = 0;
    const scrambleRounds = options.scrambleRounds ?? TYPE_DEFAULTS.scrambleRounds;

    const step = (count: number) => {
      if (isScramble && scrambleStep < scrambleRounds && count !== endCount) {
        render(count, options.cursor ?? "", true);
        scrambleStep++;
        timeoutId = setTimeout(() => step(count), Math.max(10, speed / 2));
        return;
      }
      scrambleStep = 0;

      render(count, options.cursor ?? "", false);
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
    if (options.typeStyle === "word") options.granularity = "word";

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
    const totalUnits = countTextUnits(sourceTree, options.granularity);

    const prefix = options.mode === "append" ? Array.from(el.childNodes) : [];
    if (options.mode === "append") this.baselines.set(el, prefix);
    else this.baselines.delete(el);

    return this.animate(el, sourceTree, totalUnits, options, 0, totalUnits, sourceText, {
      prefix,
      blinkOnFinish: true,
    });
  }

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
    const totalUnits = countTextUnits(sourceTree, options.granularity);

    if (options.eraseStyle === "start") {
      return this.animate(el, sourceTree, totalUnits, options, 0, totalUnits, "", {
        prefix: baseline,
        renderer: revealSuffixFragment,
      });
    }

    // 'end' & 'scramble'
    return this.animate(el, sourceTree, totalUnits, options, totalUnits, 0, "", { prefix: baseline });
  }

  sequence(steps: TypeFlowStep[], seqConfig: TypeFlowSequenceConfig = {}): TypeFlowController {
    let isInterrupted = false;
    let currentSub: TypeFlowController | null = null;
    let cancelPause: (() => void) | null = null;
    let cancelObserver: (() => void) | null = null;

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
        cancelObserver?.();
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
        } else if (step.kind === "visible") {
          const targetEl = resolveTarget(resolveStepTarget(step));
          const isVisible = await new Promise<boolean>((resolve) => {
            if (typeof IntersectionObserver === "undefined") {
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
// Vanilla Public API (Singleton)
// ============================================================

export const TypeFlow = new TypeFlowEngine();
export default TypeFlow;

export const seq = {
  type: (target?: HTMLElement | string, text = "", config?: TypeFlowConfig): TypeFlowStep => ({ kind: "type", target, text, config }),
  erase: (target?: HTMLElement | string, config?: TypeFlowConfig): TypeFlowStep => ({ kind: "erase", target, config }),
  pause: (duration: number): TypeFlowStep => ({ kind: "pause", duration }),
  visible: (target?: HTMLElement | string, threshold?: number): TypeFlowStep => ({ kind: "visible", target, threshold }),
  call: (fn: () => void | Promise<void>): TypeFlowStep => ({ kind: "call", fn }),
};

if (typeof window !== "undefined") {
  (window as unknown as { TypeFlow: TypeFlowEngine; TypeFlowSeq: typeof seq }).TypeFlow = TypeFlow;
  (window as unknown as { TypeFlow: TypeFlowEngine; TypeFlowSeq: typeof seq }).TypeFlowSeq = seq;
}

// ============================================================
// React Adapter
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
// Vue Adapter
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

// ============================================================
// Svelte Adapter (Action)
// ============================================================

export function createTypeFlowSvelte() {
  return function typeflowAction(
    node: HTMLElement,
    params: { text: string; config?: TypeFlowConfig } | string
  ) {
    let controller: TypeFlowController | null = null;

    const start = (currentParams: { text: string; config?: TypeFlowConfig } | string) => {
      controller?.stop();
      const text = typeof currentParams === "string" ? currentParams : currentParams.text;
      const config = typeof currentParams === "object" ? currentParams.config : {};
      controller = TypeFlow.type(node, text, config);
    };

    start(params);

    return {
      update(newParams: { text: string; config?: TypeFlowConfig } | string) {
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

interface SolidLike {
  createSignal: <T>(value: T) => [() => T, (v: T) => T];
  createEffect: (fn: () => void) => void;
  onCleanup: (fn: () => void) => void;
}

export function createTypeFlowSolid(Solid: SolidLike) {
  return function useTypeFlow<T extends HTMLElement = HTMLElement>(
    getText: () => string,
    config: TypeFlowConfig = {}
  ) {
    let el: T | undefined;
    let controller: TypeFlowController | null = null;

    Solid.createEffect(() => {
      const text = getText();
      if (!el) return;
      controller?.stop();
      controller = TypeFlow.type(el, text, config);
    });

    Solid.onCleanup(() => {
      controller?.stop();
    });

    return (element: T) => {
      el = element;
    };
  };
}

