/**
 * TypeFlow - TypeScript definitions
 * @version 2.2.0
 * @license MIT
 */

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

export declare class TypeFlowEngine {
  /** Types text or sanitized HTML into target element. */
  type(target: HTMLElement | string, text: string, config?: TypeFlowConfig): TypeFlowController;
  /** Erases the target's current content. */
  erase(target: HTMLElement | string, config?: TypeFlowConfig): TypeFlowController;
  /** Runs type / erase / pause / call steps in order. */
  sequence(steps: TypeFlowStep[], seqConfig?: TypeFlowSequenceConfig): TypeFlowController;
  /** QoL shortcut for the rotating text pattern. */
  rotate(target: HTMLElement | string, words: string[], config?: TypeFlowRotateConfig): TypeFlowController;
  /** Observes dynamically added DOM elements matching childSelector. */
  watch(
    container: HTMLElement | string,
    childSelector: string,
    callback: (el: HTMLElement) => void
  ): { disconnect: () => void };
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
