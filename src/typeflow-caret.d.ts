/**
 * TypeFlow Caret - Interactive Cursor Positioning & Mid-String Editing.
 */
export interface TypeFlowCaretConfig {
  /** Initial text. Defaults to the target's current text content. */
  text?: string;
  /** Initial caret index in graphemes. Defaults to the end of the text. */
  position?: number;
  /** Cursor glyph. Empty string hides it. Default: '|' */
  cursor?: string;
  /** Default: true */
  cursorBlink?: boolean;
  /** Default ms per character for `insert()`. Default: 40 */
  speed?: number;
  /** Instantly complete `insert()` instead of animating if the user prefers reduced motion. Default: true */
  respectReducedMotion?: boolean;
}

export interface TypeFlowCaretInsertConfig {
  /** Ms per character. Defaults to the speed passed to the constructor. */
  speed?: number;
  respectReducedMotion?: boolean;
  onStart?: () => void;
  onComplete?: (text: string) => void;
  onInterrupt?: () => void;
}

export interface TypeFlowCaretResult {
  completed: boolean;
  text: string;
}

export interface TypeFlowCaretController {
  stop: () => void;
  promise: Promise<TypeFlowCaretResult>;
}

export class TypeFlowCaret {
  constructor(target: Element | string, config?: TypeFlowCaretConfig);

  /** Current plain-text content, cursor excluded. */
  readonly text: string;
  /** Current caret index, in graphemes, from the start of the text. */
  readonly position: number;
  /** Total number of graphemes in the current text. */
  readonly length: number;

  /** Moves the caret to an absolute grapheme index, clamped to bounds. */
  jump(position: number): this;
  /** Moves the caret by a relative number of graphemes (positive = right, negative = left). */
  move(delta: number): this;
  /** Deletes one grapheme at the caret: 'backward' (Backspace, default) or 'forward' (Delete). */
  deleteChar(direction?: "backward" | "forward"): this;
  /** Deletes the whitespace-delimited word adjacent to the caret. */
  deleteWord(direction?: "backward" | "forward"): this;
  /** Types `text` at the current caret position, shifting following content to the right. */
  insert(text: string, config?: TypeFlowCaretInsertConfig): TypeFlowCaretController;
  /** Stops an in-flight `insert()`, if any. */
  stop(): this;
  /** Stops any in-flight `insert()` and clears the blink interval. */
  destroy(): this;
}

/** Factory form of `new TypeFlowCaret(target, config)`. */
export function Caret(target: Element | string, config?: TypeFlowCaretConfig): TypeFlowCaret;
