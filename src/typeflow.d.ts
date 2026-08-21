/**
 * TypeFlow - TypeScript definitions
 * @version 2.3.0
 * @license MIT
 */

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
  /** Reveal direction for typing: 'left' (standard LTR), 'right' (RTL), 'center' (middle-outward expand). Default: 'left' */
  direction?: "left" | "right" | "center";
  /** Reveal style for typing: 'char' (standard), 'word', 'scramble' (matrix decrypt), 'fade-trail' (soft trailing opacity ramp). Default: 'char' */
  typeStyle?: "char" | "word" | "scramble" | "fade-trail";
  /** Soft trailing opacity gradient length in characters (e.g. 3) or boolean during reveal/erase. */
  trailFade?: number | boolean;
  /** Built-in scramble charset preset name. */
  scrambleCharset?: "matrix" | "ascii" | "ascii-extended" | "blocks" | "binary" | "hex" | "braille" | "runic" | "cyber";
  /** Custom scramble glyph characters when typeStyle or eraseStyle is 'scramble'. */
  scrambleGlyphs?: string;
  /** Number of scramble iterations per unit before settling. Default: 2 */
  scrambleRounds?: number;
  /** Zero-dependency Web Audio synthesizer sound effect or custom audio callback. */
  audio?: "mechanical" | "beep" | "synth" | boolean | (() => void);
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
   * - 'end'        backspace-style, removes from the right
   * - 'start'      removes from the left, tail stays until the end
   * - 'center'     shrinks inward toward center
   * - 'scramble'   scrambles characters into glyphs before clearing
   * - 'fade-trail' dissolves trailing characters with a soft opacity ramp
   * - 'instant'    clears immediately, no animation
   * - 'fade'       CSS opacity fade-out, then clears
   */
  eraseStyle?: "end" | "start" | "center" | "scramble" | "fade-trail" | "instant" | "fade";
  /** Erase-only: duration in ms for eraseStyle 'fade'. Default: 250 */
  duration?: number;
  /**
   * Erase-only: if the target was built with mode: 'append', preserve that
   * original prefix and only erase what was typed after it. Default: true
   */
  preserveBaseline?: boolean;
  onStart?: () => void;
  onComplete?: (text: string) => void;
  onInterrupt?: () => void;
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

export interface TypeFlowStreamController {
  /** Pushes a new chunk / token into the sequential typing buffer. */
  push: (chunk: string) => void;
  /** Halts streaming and active typing immediately. */
  stop: () => void;
  /** Halts streaming and clears element text content. */
  clear: () => void;
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

export declare class TypeFlowEngine {
  /** Types text or sanitized HTML into target element. */
  type(target: HTMLElement | string, text: string, config?: TypeFlowConfig): TypeFlowController;
  /** Erases the target's current content. */
  erase(target: HTMLElement | string, config?: TypeFlowConfig): TypeFlowController;
  /** Smart Diff Morphing: calculates common prefix, erases mismatched suffix, and types new text. */
  morph(target: HTMLElement | string, nextText: string, options?: TypeFlowConfig): TypeFlowController;
  /** Creates a real-time streaming chunk ingestion controller for LLM/SSE token streams. */
  stream(
    target: HTMLElement | string,
    options?: TypeFlowConfig & { onChunk?: (chunk: string, fullText: string) => void }
  ): TypeFlowStreamController;
  /** Returns a complete configuration object for an animation preset profile. */
  preset(
    name: "cyberpunk" | "terminal" | "writer" | "matrix" | "blocks" | "subtle",
    overrides?: TypeFlowConfig
  ): TypeFlowConfig;
  /** Runs type / erase / pause / visible / call steps in order. */
  sequence(steps: TypeFlowStep[], seqConfig?: TypeFlowSequenceConfig): TypeFlowController;
  /** QoL shortcut for the rotating text pattern. */
  rotate(target: HTMLElement | string, words: string[], config?: TypeFlowRotateConfig): TypeFlowController;
  /** Staggers typing across multiple DOM elements with an offset delay between each item. */
  stagger(
    targets: HTMLElement[] | NodeList | string,
    textOrTexts?: string | string[] | ((el: HTMLElement, index: number) => string),
    config?: TypeFlowConfig & { stagger?: number }
  ): TypeFlowController;
  /** Observes dynamically added DOM elements matching childSelector. */
  watch(
    container: HTMLElement | string,
    childSelector: string,
    callback: (el: HTMLElement) => void
  ): { disconnect: () => void };
  /** Measures candidate phrases and locks target dimensions to prevent layout shift. */
  fit(target: HTMLElement | string, candidates: string[]): void;
  /** Stops the active animation for target element. */
  stop(target: HTMLElement | string): void;
  /** Stops all active TypeFlow animations. */
  stopAll(): void;
  /** Returns true if target element currently has an active animation. */
  isTyping(target: HTMLElement | string): boolean;
}

export declare const TypeFlow: TypeFlowEngine;
export default TypeFlow;

export declare const seq: {
  type: (target?: HTMLElement | string, text?: string, config?: TypeFlowConfig) => TypeFlowStep;
  erase: (target?: HTMLElement | string, config?: TypeFlowConfig) => TypeFlowStep;
  pause: (duration: number) => TypeFlowStep;
  visible: (target?: HTMLElement | string, threshold?: number) => TypeFlowStep;
  call: (fn: () => void | Promise<void>) => TypeFlowStep;
};

export interface ReactLike {
  useRef: <T>(initial: T | null) => { current: T | null };
  useEffect: (fn: () => void | (() => void), deps: unknown[]) => void;
}

export declare function createTypeFlowReact(React: ReactLike): <T extends HTMLElement = HTMLElement>(
  text: string,
  config?: TypeFlowConfig
) => { current: T | null };

export declare function createTypeFlowSequenceReact(
  React: ReactLike
): (buildSteps: () => TypeFlowStep[], deps: unknown[]) => void;

export interface VueLike {
  ref: <T>(initial: T | null) => { value: T | null };
  watch: (source: unknown, cb: () => void, opts?: { immediate?: boolean }) => void;
  onBeforeUnmount: (cb: () => void) => void;
}

export declare function createTypeFlowVue(Vue: VueLike): <T extends HTMLElement = HTMLElement>(
  getText: () => string,
  config?: TypeFlowConfig
) => { value: T | null };

export declare function createTypeFlowSequenceVue(
  Vue: VueLike
): (buildSteps: () => TypeFlowStep[]) => () => void;

export declare function createTypeFlowSvelte(): (
  node: HTMLElement,
  params: { text: string; config?: TypeFlowConfig } | string
) => {
  update: (newParams: { text: string; config?: TypeFlowConfig } | string) => void;
  destroy: () => void;
};

export interface SolidLike {
  createSignal: <T>(value: T) => [() => T, (v: T) => T];
  createEffect: (fn: () => void) => void;
  onCleanup: (fn: () => void) => void;
}

export declare function createTypeFlowSolid(
  Solid: SolidLike
): <T extends HTMLElement = HTMLElement>(
  getText: () => string,
  config?: TypeFlowConfig
) => (element: T) => void;

