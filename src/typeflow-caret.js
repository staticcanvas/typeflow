/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
 * @description TypeFlow Caret - Interactive Cursor Positioning & Mid-String Editing.
 * A persistent, editable cursor bound to an element's text: jump or move to any
 * grapheme index, delete a character or whole word at that position, and type
 * new text in with the usual character-by-character animation. Zero
 * dependencies; opportunistically defers to a page-global TypeFlow so starting
 * a `TypeFlow.type()`/`erase()` on the same element interrupts an in-flight
 * caret edit, without requiring a hard import of the core engine.
 *
 * @module @staticcanvas/typeflow/caret
 */

const CURSOR_BLINK_INTERVAL = 530;
const WHITESPACE_UNIT = /^\s+$/u;

function segmentGraphemes(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return Array.from(
      new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
      (s) => s.segment
    );
  }
  return Array.from(text);
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Stops any animation the page-global TypeFlow engine may have active on `el`, if present. */
function stopPageTypeFlow(el) {
  if (typeof window !== 'undefined') window.TypeFlow?.stop?.(el);
}

function clampCaretIndex(position, max) {
  const value = position === undefined || position === null ? max : Number(position);
  if (!Number.isFinite(value)) return max;
  return Math.max(0, Math.min(Math.round(value), max));
}

function createCursorSpan(cursorChar) {
  const span = document.createElement('span');
  span.className = 'tf-cursor';
  span.setAttribute('aria-hidden', 'true');
  span.textContent = cursorChar;
  return span;
}

/**
 * Interactive, stateful cursor bound to an element's text content.
 *
 * Unlike `TypeFlow.type()`/`erase()`, which run once from start to finish, a
 * Caret is persistent: `jump()`, `move()`, `deleteChar()`, and `deleteWord()`
 * edit `text`/`position` and re-render immediately; `insert()` is animated
 * and returns a `{ stop, promise }` controller.
 */
export class TypeFlowCaret {
  /**
   * @param {Element | string} target - Element or CSS selector.
   * @param {object} [config={}]
   * @param {string} [config.text] - Initial text. Defaults to the target's current text content.
   * @param {number} [config.position] - Initial caret index in graphemes. Defaults to the end of the text.
   * @param {string} [config.cursor='|'] - Cursor glyph. Empty string hides it.
   * @param {boolean} [config.cursorBlink=true]
   * @param {number} [config.speed=40] - Default ms per character for `insert()`.
   * @param {boolean} [config.respectReducedMotion=true]
   *
   * @example
   * const caret = new TypeFlowCaret('#terminal', { text: 'git commit -m "wip"' });
   * caret.jump(3).deleteWord('forward').insert('push');
   * // "git push -m "wip""
   */
  constructor(target, config = {}) {
    this.el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.el) throw new Error('TypeFlowCaret: target element not found.');
    stopPageTypeFlow(this.el);

    this.cursor = config.cursor ?? '|';
    this.cursorBlink = config.cursorBlink ?? true;
    this.speed = config.speed ?? 40;
    this.respectReducedMotion = config.respectReducedMotion ?? true;
    this.units = segmentGraphemes(config.text ?? this.el.textContent ?? '');
    this.index = clampCaretIndex(config.position ?? this.units.length, this.units.length);
    this._blinkInterval = null;
    this._activeInsert = null;
    this._render();
  }

  /** Current plain-text content, cursor excluded. */
  get text() {
    return this.units.join('');
  }

  /** Current caret index, in graphemes, from the start of the text. */
  get position() {
    return this.index;
  }

  /** Total number of graphemes in the current text. */
  get length() {
    return this.units.length;
  }

  /** Moves the caret to an absolute grapheme index, clamped to bounds. */
  jump(position) {
    this._stopInsert();
    this.index = clampCaretIndex(position, this.units.length);
    this._render();
    return this;
  }

  /** Moves the caret by a relative number of graphemes (positive = right, negative = left). */
  move(delta) {
    return this.jump(this.index + (Number(delta) || 0));
  }

  /**
   * Deletes one grapheme at the caret.
   * @param {'backward'|'forward'} [direction='backward'] - `'backward'` removes the character before the caret (Backspace); `'forward'` removes the character at/after it (Delete).
   */
  deleteChar(direction = 'backward') {
    this._stopInsert();
    if (direction === 'forward') {
      if (this.index < this.units.length) this.units.splice(this.index, 1);
    } else if (this.index > 0) {
      this.units.splice(this.index - 1, 1);
      this.index -= 1;
    }
    this._render();
    return this;
  }

  /**
   * Deletes the whitespace-delimited word adjacent to the caret.
   * @param {'backward'|'forward'} [direction='backward'] - `'backward'` removes the word (and any whitespace immediately before it) that precedes the caret; `'forward'` removes the word (and any whitespace immediately after it) that follows.
   */
  deleteWord(direction = 'backward') {
    this._stopInsert();
    if (direction === 'forward') {
      let end = this.index;
      let ateLeadingSpace = false;
      while (end < this.units.length && WHITESPACE_UNIT.test(this.units[end])) {
        end += 1;
        ateLeadingSpace = true;
      }
      while (end < this.units.length && !WHITESPACE_UNIT.test(this.units[end])) end += 1;
      if (!ateLeadingSpace) {
        while (end < this.units.length && WHITESPACE_UNIT.test(this.units[end])) end += 1;
      }
      if (end === this.index) return this;
      this.units.splice(this.index, end - this.index);
    } else {
      let start = this.index;
      while (start > 0 && WHITESPACE_UNIT.test(this.units[start - 1])) start -= 1;
      while (start > 0 && !WHITESPACE_UNIT.test(this.units[start - 1])) start -= 1;
      if (start === this.index) return this;
      this.units.splice(start, this.index - start);
      this.index = start;
    }
    this._render();
    return this;
  }

  /**
   * Types `text` at the current caret position, one grapheme at a time,
   * shifting any following content to the right as it goes.
   *
   * @param {string} text
   * @param {object} [config={}]
   * @param {number} [config.speed] - Ms per character. Defaults to the speed passed to the constructor.
   * @param {boolean} [config.respectReducedMotion]
   * @param {() => void} [config.onStart]
   * @param {(text: string) => void} [config.onComplete]
   * @param {() => void} [config.onInterrupt]
   * @returns {{ stop: () => void, promise: Promise<{completed: boolean, text: string}> }}
   */
  insert(text, config = {}) {
    this._stopInsert();
    const insertUnits = segmentGraphemes(text === null || text === undefined ? '' : String(text));
    const speed = Math.max(0, Number(config.speed ?? this.speed) || 0);
    const startIndex = this.index;

    let settled = false;
    let timeoutId = null;
    let resolveFn = null;
    const settle = (completed) => {
      if (settled) return;
      settled = true;
      if (timeoutId !== null) clearTimeout(timeoutId);
      this._activeInsert = null;
      if (completed) config.onComplete?.(this.text);
      else config.onInterrupt?.();
      resolveFn?.({ completed, text: this.text });
    };
    const controller = {
      stop: () => settle(false),
      promise: new Promise((resolve) => {
        resolveFn = resolve;
      }),
    };
    this._activeInsert = controller;

    if (insertUnits.length === 0) {
      settle(true);
      return controller;
    }

    const respectReducedMotion = config.respectReducedMotion ?? this.respectReducedMotion;
    if (respectReducedMotion === true && prefersReducedMotion()) {
      this.units.splice(startIndex, 0, ...insertUnits);
      this.index = startIndex + insertUnits.length;
      this._render();
      settle(true);
      return controller;
    }

    config.onStart?.();
    let step = 0;
    const tick = () => {
      this.units.splice(startIndex + step, 0, insertUnits[step]);
      this.index = startIndex + step + 1;
      this._render();
      step += 1;
      if (step >= insertUnits.length) {
        settle(true);
        return;
      }
      timeoutId = setTimeout(tick, speed);
    };
    timeoutId = setTimeout(tick, speed);
    return controller;
  }

  /** Stops an in-flight `insert()`, if any. */
  stop() {
    this._stopInsert();
    return this;
  }

  /** Stops any in-flight `insert()` and clears the blink interval. Call when done with a caret. */
  destroy() {
    this._stopInsert();
    if (this._blinkInterval !== null) {
      clearInterval(this._blinkInterval);
      this._blinkInterval = null;
    }
    return this;
  }

  _stopInsert() {
    this._activeInsert?.stop();
    stopPageTypeFlow(this.el);
  }

  _render() {
    if (this._blinkInterval !== null) {
      clearInterval(this._blinkInterval);
      this._blinkInterval = null;
    }
    const before = this.units.slice(0, this.index).join('');
    const after = this.units.slice(this.index).join('');
    this.el.replaceChildren(document.createTextNode(before));

    if (this.cursor) {
      const cursorSpan = createCursorSpan(this.cursor);
      this.el.appendChild(cursorSpan);
      if (this.cursorBlink) {
        let visible = true;
        this._blinkInterval = setInterval(() => {
          visible = !visible;
          cursorSpan.style.visibility = visible ? 'visible' : 'hidden';
        }, CURSOR_BLINK_INTERVAL);
        this._blinkInterval.unref?.();
      }
    }

    this.el.appendChild(document.createTextNode(after));
  }
}

/**
 * Factory form of `new TypeFlowCaret(target, config)`.
 *
 * @param {Element | string} target
 * @param {object} [config]
 * @returns {TypeFlowCaret}
 *
 * @example
 * const caret = Caret('#terminal', { text: 'git commit' });
 * caret.move(-6).insert('push --force ');
 */
export function Caret(target, config) {
  return new TypeFlowCaret(target, config);
}

if (typeof window !== 'undefined') {
  window.TypeFlowCaret = TypeFlowCaret;
  window.Caret = Caret;
}
