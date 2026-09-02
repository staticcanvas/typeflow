/**
 * TypeFlow - A lightweight, interruptible, framework-agnostic typewriter library
 * @version 2.3.0
 * @license MIT
 *
 * Zero dependencies. Safe by default (no innerHTML string concatenation).
 * Vanilla-first, with Intl.Segmenter support, multi-style reveals, and integrations for React, Vue, Svelte, Solid.js, Alpine.js, and Web Components.
 */

// ============================================================
// Constants
// ============================================================

const SCRAMBLE_CHARSETS = {
  matrix: '01X_#*~<>[]{}',
  ascii: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  'ascii-extended': '¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿',
  blocks: ' ▂▃▄▅▆▇█░▒▓',
  binary: '01',
  hex: '0123456789ABCDEF',
  braille: '⠁⠃⠇⠏⠟⠿⡿⣿',
  runic: 'ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯ',
  cyber: '!<>-_\\/[]{}—=+*^?#________',
};

const PRESETS = {
  cyberpunk: {
    typeStyle: 'scramble',
    scrambleCharset: 'matrix',
    scrambleRounds: 2,
    speed: 40,
    cursor: '|',
    cursorBlink: true,
    audio: 'synth',
  },
  terminal: {
    typeStyle: 'char',
    speed: 32,
    cursor: '█',
    cursorBlink: true,
    audio: 'mechanical',
  },
  writer: {
    naturalCadence: true,
    speed: 52,
    speedVariance: 22,
    cursor: '|',
    cursorBlink: true,
    audio: 'mechanical',
  },
  matrix: {
    typeStyle: 'scramble',
    scrambleCharset: 'matrix',
    scrambleRounds: 3,
    speed: 30,
    cursor: '█',
    cursorBlink: true,
    audio: 'synth',
  },
  blocks: {
    typeStyle: 'scramble',
    scrambleCharset: 'blocks',
    scrambleRounds: 2,
    speed: 45,
    cursor: '█',
    cursorBlink: true,
  },
  subtle: {
    speed: 45,
    cursor: '|',
    cursorBlink: true,
    eraseStyle: 'fade',
    respectReducedMotion: true,
  },
};

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
  direction: 'left',
  typeStyle: 'char',
  scrambleCharset: 'cyber',
  scrambleGlyphs: '!<>-_\\/[]{}—=+*^?#________',
  scrambleRounds: 2,
  audio: null,
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

const CURSOR_BLINK_INTERVAL = 530;
const DEFAULT_FADE_DURATION = 250;
const DEFAULT_WORD_FADE_DURATION = 280;
const DEFAULT_WORD_STAGGER = 70;
// Shared spatial-motion tokens reused by every `float-in-*` and `zoom-in-space`
// reveal/erase variant so distance, depth, and perspective stay consistent.
const DEFAULT_MOTION_DISTANCE = 24;
const DEFAULT_MOTION_DEPTH = 160;
const DEFAULT_MOTION_SCALE = 0.82;
const DEFAULT_MOTION_PERSPECTIVE = 600;
const DEFAULT_MOTION_EASING = 'ease';

const WORD_MOTION_STYLES = new Set([
  'word-fade',
  'float-in-top',
  'float-in-bottom',
  'float-in-left',
  'float-in-right',
  'zoom-in-space',
]);

// ============================================================
// Web Audio Micro-Synthesizer
// ============================================================

let audioCtx = null;
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioCtx();
    } catch {
      return null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playKeystrokeSound(audioOption) {
  if (!audioOption) return;
  if (typeof audioOption === 'function') {
    try {
      audioOption();
    } catch {
      // Audio callbacks are optional and must not interrupt typing.
    }
    return;
  }
  const type = typeof audioOption === 'string' ? audioOption : 'mechanical';
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } else if (type === 'synth') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else {
      // 'mechanical' switch click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100 + Math.random() * 300, now);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    }
  } catch {
    // Audio playback is best effort and may be unavailable in the browser.
  }
}

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

function resolveScrambleGlyphs(glyphs, charset) {
  if (charset && SCRAMBLE_CHARSETS[charset]) return SCRAMBLE_CHARSETS[charset];
  if (typeof glyphs === 'string' && SCRAMBLE_CHARSETS[glyphs]) return SCRAMBLE_CHARSETS[glyphs];
  return glyphs ?? SCRAMBLE_CHARSETS.cyber;
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
// Reveal Engines (Universal Window Slice)
// ============================================================

function countTextUnits(node, granularity = 'grapheme') {
  if (node.nodeType === 3) {
    return segmentText(node.textContent ?? '', granularity).length;
  }
  let total = 0;
  node.childNodes.forEach((child) => (total += countTextUnits(child, granularity)));
  return total;
}

function cloneRevealWindow(node, start, end, granularity = 'grapheme', revealOpts = {}) {
  if (node.nodeType === 3) {
    const text = node.textContent ?? '';
    const units = segmentText(text, granularity);
    const len = units.length;
    if (end <= 0 || start >= len) {
      return { clone: null, start: Math.max(0, start - len), end: Math.max(0, end - len) };
    }
    const s = Math.max(0, start);
    const e = Math.min(len, end);

    const doc = node?.ownerDocument || (typeof document !== 'undefined' ? document : null);
    if (!doc) return { clone: null, start, end };

    if (revealOpts?.scrambleActive && e > s && units[e - 1]?.trim()) {
      const frag = doc.createDocumentFragment();
      if (e - 1 > s) {
        frag.appendChild(doc.createTextNode(units.slice(s, e - 1).join('')));
      }
      const scrambleSpan = doc.createElement('span');
      scrambleSpan.className = 'tf-scramble';
      if (revealOpts.scrambleColor) {
        scrambleSpan.style.color = revealOpts.scrambleColor;
      }
      if (revealOpts.scrambleGradient) {
        scrambleSpan.style.backgroundImage = revealOpts.scrambleGradient;
        scrambleSpan.style.webkitBackgroundImage = revealOpts.scrambleGradient;
        scrambleSpan.style.webkitBackgroundClip = 'text';
        scrambleSpan.style.backgroundClip = 'text';
        scrambleSpan.style.webkitTextFillColor = 'transparent';
        scrambleSpan.style.display = 'inline-block';
      }
      scrambleSpan.textContent = getRandomGlyph(revealOpts.scrambleGlyphs);
      frag.appendChild(scrambleSpan);
      return {
        clone: frag,
        start: Math.max(0, start - len),
        end: Math.max(0, end - len),
      };
    }

    const trailLen = typeof revealOpts.trailFade === 'number'
      ? revealOpts.trailFade
      : (typeof revealOpts.trailingFadeLength === 'number'
          ? revealOpts.trailingFadeLength
          : (revealOpts.trailFade ? 4 : 0));

    if (trailLen > 0 && (e - s) >= 1 && !revealOpts.isComplete) {
      const frag = doc.createDocumentFragment();
      const solidEnd = Math.max(s, e - trailLen);
      if (solidEnd > s) {
        frag.appendChild(doc.createTextNode(units.slice(s, solidEnd).join('')));
      }
      const trailCount = e - solidEnd;
      const minOp = typeof revealOpts.trailingFadeMinOpacity === 'number'
        ? revealOpts.trailingFadeMinOpacity
        : (typeof revealOpts.trailMinOpacity === 'number' ? revealOpts.trailMinOpacity : 0.18);
      for (let i = 0; i < trailCount; i++) {
        const charIdx = solidEnd + i;
        const charSpan = doc.createElement('span');
        charSpan.className = 'tf-trail';
        const progress = trailCount <= 1 ? 1 : (i + 1) / trailCount;
        const opacity = minOp + (1.0 - minOp) * progress;
        charSpan.style.opacity = opacity.toFixed(3);
        charSpan.textContent = units[charIdx];
        frag.appendChild(charSpan);
      }
      return {
        clone: frag,
        start: Math.max(0, start - len),
        end: Math.max(0, end - len),
      };
    }

    const sliced = units.slice(s, e).join('');
    return {
      clone: doc.createTextNode(sliced),
      start: Math.max(0, start - len),
      end: Math.max(0, end - len),
    };
  }
  if (node.nodeType === 1) {
    const el = node;
    const tag = el.tagName.toLowerCase();
    if (VOID_ELEMENTS.has(tag)) {
      if (end <= 0) return { clone: null, start, end };
      return { clone: el.cloneNode(false), start, end };
    }
    const clone = el.cloneNode(false);
    let curStart = start;
    let curEnd = end;
    let appended = false;
    node.childNodes.forEach((child) => {
      const result = cloneRevealWindow(child, curStart, curEnd, granularity, revealOpts);
      if (result.clone) {
        clone.appendChild(result.clone);
        appended = true;
      }
      curStart = result.start;
      curEnd = result.end;
    });
    return { clone: appended ? clone : null, start: curStart, end: curEnd };
  }
  return { clone: null, start, end };
}

function revealWindowFragment(source, start, end, granularity = 'grapheme', revealOpts = {}) {
  const doc = source?.ownerDocument || (typeof document !== 'undefined' ? document : null);
  if (!doc) return null;
  const out = doc.createDocumentFragment();
  let curStart = start;
  let curEnd = end;
  source.childNodes.forEach((child) => {
    const result = cloneRevealWindow(child, curStart, curEnd, granularity, revealOpts);
    if (result.clone) out.appendChild(result.clone);
    curStart = result.start;
    curEnd = result.end;
  });
  return out;
}

function calculateWindowBounds(count, totalUnits, direction, eraseStyle, isErasing) {
  if (isErasing) {
    if (eraseStyle === 'start') {
      return { start: totalUnits - count, end: totalUnits };
    }
    if (eraseStyle === 'center') {
      const s = Math.max(0, Math.floor((totalUnits - count) / 2));
      return {
        start: s,
        end: Math.min(totalUnits, s + count),
      };
    }
    return { start: 0, end: count };
  }

  if (direction === 'right') {
    return { start: totalUnits - count, end: totalUnits };
  }
  if (direction === 'center') {
    const s = Math.max(0, Math.floor((totalUnits - count) / 2));
    return {
      start: s,
      end: Math.min(totalUnits, s + count),
    };
  }
  return { start: 0, end: count };
}

// ============================================================
// Core Engine
// ============================================================

function resolveTarget(target) {
  const el = resolveMaybeTarget(target);
  if (!el) {
    const desc = target === null ? 'null' : target === undefined ? 'undefined' : String(target);
    throw new Error(`TypeFlow: target element not found (${desc})`);
  }
  return el;
}

function resolveMaybeTarget(target) {
  return typeof target === 'string' ? document.querySelector(target) : target;
}

function normalizeDirection(dir) {
  if (!dir) return 'left';
  const s = String(dir).toLowerCase();
  if (s === 'right' || s === 'rtl' || s === 'end' || s === 'reverse') return 'right';
  if (s === 'center' || s === 'middle' || s === 'expand' || s === 'both') return 'center';
  return 'left';
}

function normalizeTypeStyle(style) {
  if (!style) return 'char';
  const s = String(style).toLowerCase();
  if (s === 'word' || s === 'words' || s === 'stream') return 'word';
  if (s === 'scramble' || s === 'matrix' || s === 'decrypt' || s === 'cyber' || s === 'random') return 'scramble';
  if (s === 'fade-trail' || s === 'trail' || s === 'trailing' || s === 'soft') return 'fade-trail';
  if (s === 'word-fade' || s === 'fade-words' || s === 'wordfade') return 'word-fade';
  if (s === 'float-in-top' || s === 'float-top' || s === 'float-down') return 'float-in-top';
  if (s === 'float-in-bottom' || s === 'float-bottom' || s === 'float-up') return 'float-in-bottom';
  if (s === 'float-in-left' || s === 'float-left') return 'float-in-left';
  if (s === 'float-in-right' || s === 'float-right') return 'float-in-right';
  if (s === 'zoom-in-space' || s === 'zoom-in' || s === 'zoom-space') return 'zoom-in-space';
  return 'char';
}

function normalizeEraseStyle(style) {
  if (!style) return 'end';
  const s = String(style).toLowerCase();
  if (s === 'start' || s === 'erosion' || s === 'left' || s === 'forward') return 'start';
  if (s === 'center' || s === 'middle' || s === 'shrink' || s === 'split') return 'center';
  if (s === 'scramble' || s === 'matrix' || s === 'decrypt' || s === 'cyber' || s === 'random') return 'scramble';
  if (s === 'fade-trail' || s === 'trail' || s === 'trailing' || s === 'soft') return 'fade-trail';
  if (s === 'fade' || s === 'dissolve' || s === 'crossfade') return 'fade';
  if (s === 'word-fade' || s === 'fade-words' || s === 'wordfade') return 'word-fade';
  if (s === 'float-in-top' || s === 'float-top' || s === 'float-down') return 'float-in-top';
  if (s === 'float-in-bottom' || s === 'float-bottom' || s === 'float-up') return 'float-in-bottom';
  if (s === 'float-in-left' || s === 'float-left') return 'float-in-left';
  if (s === 'float-in-right' || s === 'float-right') return 'float-in-right';
  if (s === 'zoom-in-space' || s === 'zoom-in' || s === 'zoom-space') return 'zoom-in-space';
  if (s === 'instant' || s === 'clear' || s === 'reset' || s === 'immediate') return 'instant';
  return 'end';
}

function normalizeWordOrder(order) {
  const value = String(order ?? 'left-to-right').toLowerCase();
  if (value === 'right-to-left' || value === 'reverse' || value === 'rtl') return 'right-to-left';
  if (value === 'random' || value === 'shuffle') return 'random';
  return 'left-to-right';
}

function createSeededRandom(seed) {
  if (seed === undefined || seed === null) return Math.random;
  const text = String(seed);
  let state = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    state ^= text.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function orderWordIndexes(length, order, seed) {
  const indexes = Array.from({ length }, (_, index) => index);
  if (normalizeWordOrder(order) === 'right-to-left') return indexes.reverse();
  if (normalizeWordOrder(order) !== 'random') return indexes;

  const random = createSeededRandom(seed);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes;
}

function segmentWords(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text));
  }
  return (text.match(/\s+|\S+/g) ?? []).map((segment) => ({
    segment,
    isWordLike: !/^\s+$/u.test(segment),
  }));
}

/**
 * Resolves the hidden/visible transform pair for a spatial word-motion style.
 * Returns `null` for the plain `word-fade` style, which is opacity-only and
 * needs no transform (so words keep `display: inline` and normal text flow).
 */
function getWordMotionTransforms(motionKind, options) {
  const distance = Math.max(0, Number(options.wordMotionDistance ?? DEFAULT_MOTION_DISTANCE) || 0);
  const depth = Math.max(0, Number(options.wordMotionDepth ?? DEFAULT_MOTION_DEPTH) || 0);
  const scale = Math.min(1, Math.max(0.01, Number(options.wordMotionScale ?? DEFAULT_MOTION_SCALE) || DEFAULT_MOTION_SCALE));

  switch (motionKind) {
    case 'float-in-top': return { hidden: `translateY(-${distance}px)`, visible: 'translateY(0)' };
    case 'float-in-bottom': return { hidden: `translateY(${distance}px)`, visible: 'translateY(0)' };
    case 'float-in-left': return { hidden: `translateX(-${distance}px)`, visible: 'translateX(0)' };
    case 'float-in-right': return { hidden: `translateX(${distance}px)`, visible: 'translateX(0)' };
    case 'zoom-in-space': return { hidden: `translateZ(-${depth}px) scale(${scale})`, visible: 'translateZ(0) scale(1)' };
    default: return null;
  }
}

function buildWordMotionTree(source, layout = 'opacity', motionKind = 'word-fade') {
  const doc = source?.ownerDocument || (typeof document !== 'undefined' ? document : null);
  if (!doc) return { fragment: null, words: [] };
  const fragment = doc.createDocumentFragment();
  const words = [];
  // Transform has no effect on `display: inline` boxes, so transformed
  // variants promote each word wrapper to `inline-block`.
  const needsTransform = motionKind !== 'word-fade';

  const walk = (sourceNode, targetNode) => {
    sourceNode.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        for (const part of segmentWords(child.textContent ?? '')) {
          if (/^\s+$/u.test(part.segment)) {
            targetNode.appendChild(doc.createTextNode(part.segment));
            continue;
          }

          if (part.isWordLike === false && words.length > 0 && words.at(-1).parentNode === targetNode) {
            words.at(-1).appendChild(doc.createTextNode(part.segment));
            continue;
          }

          const wrapper = doc.createElement('span');
          wrapper.className = 'tf-word-fade';
          wrapper.dataset.tfWordIndex = String(words.length);
          wrapper.textContent = part.segment;
          wrapper.style.display = needsTransform ? 'inline-block' : 'inline';
          wrapper.style.opacity = '0';
          wrapper.style.willChange = needsTransform ? 'opacity, transform' : 'opacity';
          wrapper.setAttribute('aria-hidden', 'true');
          if (layout === 'placeholder') wrapper.style.visibility = 'hidden';
          words.push(wrapper);
          targetNode.appendChild(wrapper);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const clone = child.cloneNode(false);
        targetNode.appendChild(clone);
        walk(child, clone);
      }
    });
  };

  walk(source, fragment);
  return { fragment, words };
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

/**
 * Core animation engine that manages all active TypeFlow instances.
 *
 * Each target element may have at most one active animation at a time.
 * Starting a new animation on an already-animating element stops the previous
 * one before beginning the new one.
 *
 * Accessed via the exported singleton {@link TypeFlow}.
 *
 * @class
 */
class TypeFlowEngine {
  active = new Map();
  baselines = new WeakMap();
  cursorIntervals = new Map();

  clearCursorInterval(el) {
    const interval = this.cursorIntervals.get(el);
    if (interval) {
      clearInterval(interval);
      this.cursorIntervals.delete(el);
    }
  }

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
    this.clearCursorInterval(el);
    this.active.get(el)?.stop();
    if (options.ariaLive) el.setAttribute('aria-live', options.ariaLive);

    const prefix = extra.prefix ?? [];
    const blinkOnFinish = extra.blinkOnFinish ?? false;
    const direction = endCount >= startCount ? 1 : -1;
    const speed = Math.max(0, Number(options.speed ?? TYPE_DEFAULTS.speed) || 0);
    const granularity = options.granularity ?? TYPE_DEFAULTS.granularity;
    const isScramble = options.typeStyle === 'scramble' || options.eraseStyle === 'scramble';
    const scrambleGlyphs = resolveScrambleGlyphs(options.scrambleGlyphs, options.scrambleCharset ?? options.scramblePreset);

    let settled = false;
    let timeoutId = null;
    let resolveFn = null;

    const clearTimers = () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      this.clearCursorInterval(el);
      timeoutId = null;
    };

    const createCursorSpan = (cursorChar, isHidden = false) => {
      const span = document.createElement('span');
      span.className = 'tf-cursor';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = cursorChar;
      if (isHidden) {
        span.style.visibility = 'hidden';
      }
      return span;
    };

    const render = (unitCount, cursorChar, scrambleActive = false, cursorHidden = false) => {
      const bounds = calculateWindowBounds(
        unitCount,
        totalUnits,
        options.direction ?? 'left',
        options.eraseStyle ?? 'end',
        extra.isErasing ?? false
      );
      const isTrailFade =
        (options.trailFade !== null && options.trailFade !== undefined) ||
        (options.trailingFadeLength !== null && options.trailingFadeLength !== undefined) ||
        options.typeStyle === 'fade-trail' ||
        options.eraseStyle === 'fade-trail';
      const trailLen =
        typeof options.trailFade === 'number'
          ? options.trailFade
          : (typeof options.trailingFadeLength === 'number'
              ? options.trailingFadeLength
              : (isTrailFade ? (options.trailingFadeLength ?? 4) : 0));
      const trailMinOpacity =
        typeof options.trailingFadeMinOpacity === 'number'
          ? options.trailingFadeMinOpacity
          : (typeof options.trailMinOpacity === 'number'
              ? options.trailMinOpacity
              : 0.18);

      el.replaceChildren(
        ...prefix,
        revealWindowFragment(sourceTree, bounds.start, bounds.end, granularity, {
          scrambleActive,
          scrambleGlyphs,
          scrambleColor: options.scrambleColor,
          scrambleGradient: options.scrambleGradient,
          trailFade: trailLen,
          trailingFadeLength: trailLen,
          trailingFadeMinOpacity: trailMinOpacity,
          isComplete: unitCount === endCount && !scrambleActive,
        })
      );
      if (cursorChar) {
        el.appendChild(createCursorSpan(cursorChar, cursorHidden));
      }
    };

    const settle = (completed) => {
      if (settled) return;
      settled = true;
      clearTimers();
      this.active.delete(el);
      if (completed) {
        if (blinkOnFinish && options.cursor && options.cursorBlink) {
          let visible = true;
          render(endCount, options.cursor, false, false);
          const intervalId = setInterval(() => {
            visible = !visible;
            render(endCount, options.cursor, false, !visible);
          }, CURSOR_BLINK_INTERVAL);
          intervalId.unref?.();
          this.cursorIntervals.set(el, intervalId);
        } else {
          render(endCount, '', false);
        }
        options.onComplete?.(resultText);
      } else {
        this.clearCursorInterval(el);
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
      if (options.audio) playKeystrokeSound(options.audio);

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

  animateWordMotion(el, sourceTree, options, extra = {}) {
    this.clearCursorInterval(el);
    this.active.get(el)?.stop();
    if (options.ariaLive) el.setAttribute('aria-live', options.ariaLive);

    const prefix = extra.prefix ?? [];
    const isErasing = extra.isErasing === true;
    const motionKind = extra.motionKind ?? 'word-fade';
    const layout = options.wordLayout === 'placeholder' ? 'placeholder' : 'opacity';
    const duration = Math.max(0, Number(options.wordFadeDuration ?? DEFAULT_WORD_FADE_DURATION) || 0);
    const stagger = Math.max(0, Number(options.wordStagger ?? options.speed ?? DEFAULT_WORD_STAGGER) || 0);
    const transforms = getWordMotionTransforms(motionKind, options);
    const needsPerspective = motionKind === 'zoom-in-space';
    const { fragment, words } = buildWordMotionTree(sourceTree, layout, motionKind);
    const order = orderWordIndexes(words.length, options.wordOrder, options.wordSeed);
    order.forEach((wordIndex, sequenceIndex) => {
      words[wordIndex].dataset.tfWordOrder = String(sequenceIndex);
    });
    const timers = new Set();
    let frameId = null;
    let settled = false;
    let resolveFn = null;

    const easing = typeof options.wordMotionEasing === 'string' && options.wordMotionEasing.trim()
      ? options.wordMotionEasing.trim()
      : DEFAULT_MOTION_EASING;

    words.forEach((word) => {
      word.style.transition = transforms
        ? `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`
        : `opacity ${duration}ms ${easing}`;
      if (transforms) word.style.transform = transforms.hidden;
      if (isErasing) {
        word.style.opacity = '1';
        word.style.visibility = 'visible';
        word.removeAttribute('aria-hidden');
        if (transforms) word.style.transform = transforms.visible;
      }
    });
    if (needsPerspective) {
      el.style.perspective = `${Math.max(0, Number(options.wordMotionPerspective ?? DEFAULT_MOTION_PERSPECTIVE) || 0)}px`;
      el.style.transformStyle = 'preserve-3d';
    }
    el.replaceChildren(...prefix, fragment);
    el.setAttribute('aria-busy', 'true');

    const schedule = (callback, delay) => {
      const id = setTimeout(() => {
        timers.delete(id);
        callback();
      }, delay);
      timers.add(id);
    };
    const clearScheduledWork = () => {
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      if (frameId !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frameId);
      frameId = null;
    };
    const appendCursor = () => {
      if (!options.cursor) return;
      const cursor = document.createElement('span');
      cursor.className = 'tf-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.textContent = options.cursor;
      el.appendChild(cursor);
      if (options.cursorBlink) {
        let visible = true;
        const intervalId = setInterval(() => {
          visible = !visible;
          cursor.style.visibility = visible ? 'visible' : 'hidden';
        }, CURSOR_BLINK_INTERVAL);
        intervalId.unref?.();
        this.cursorIntervals.set(el, intervalId);
      }
    };
    const settle = (completed) => {
      if (settled) return;
      settled = true;
      clearScheduledWork();
      this.active.delete(el);
      el.removeAttribute('aria-busy');
      if (needsPerspective) {
        el.style.removeProperty('perspective');
        el.style.removeProperty('transform-style');
      }

      if (completed) {
        if (isErasing) {
          el.replaceChildren(...prefix);
          options.onComplete?.('');
        } else {
          el.replaceChildren(...prefix, sourceTree.cloneNode(true));
          appendCursor();
          options.onComplete?.(extra.resultText ?? '');
        }
      } else {
        words.forEach((word) => { word.style.willChange = 'auto'; });
        options.onInterrupt?.();
      }
      resolveFn?.({ completed, text: isErasing ? '' : (extra.resultText ?? '') });
    };
    const controller = {
      stop: () => settle(false),
      promise: new Promise((resolve) => { resolveFn = resolve; }),
    };
    this.active.set(el, controller);

    if (options.respectReducedMotion === true && prefersReducedMotion()) {
      settle(true);
      return controller;
    }

    options.onStart?.();
    const begin = () => {
      frameId = requestAnimationFrame(() => {
        frameId = null;
        if (words.length === 0) {
          settle(true);
          return;
        }
        let sequenceIndex = 0;
        const revealNextWord = () => {
          const word = words[order[sequenceIndex]];
          if (options.audio) playKeystrokeSound(options.audio);
          if (isErasing) {
            word.style.opacity = '0';
            if (transforms) word.style.transform = transforms.hidden;
            word.setAttribute('aria-hidden', 'true');
          } else {
            word.style.visibility = 'visible';
            word.removeAttribute('aria-hidden');
            word.style.opacity = '1';
            if (transforms) word.style.transform = transforms.visible;
          }

          sequenceIndex += 1;
          if (sequenceIndex < words.length) schedule(revealNextWord, stagger);
          else schedule(() => settle(true), duration);
        };
        revealNextWord();
      });
    };

    schedule(begin, Math.max(0, Number(options.delay) || 0));
    return controller;
  }

  eraseFade(el, erasableLive, baseline, options) {
    this.clearCursorInterval(el);
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
      this.clearCursorInterval(el);
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
    this.clearCursorInterval(el);
    this.active.get(el)?.stop();
    el.replaceChildren(...baseline);
    options.onComplete?.('');
    return { stop: () => {}, promise: Promise.resolve({ completed: true, text: '' }) };
  }

  /**
   * Types text or sanitized HTML into the target element character by character
   * (or word by word when `typeStyle: 'word'`).
   *
   * Any animation currently running on `target` is stopped before the new one
   * starts. If `prefers-reduced-motion: reduce` is active and
   * `respectReducedMotion` is `true` (the default), the full text is rendered
   * immediately without animation.
   *
   * @param {Element | string} target
   *   A DOM element or a CSS selector string resolved via `document.querySelector`.
   * @param {string} text
   *   The text or HTML string to type. When `config.html` is `false` (default)
   *   the string is treated as plain text and no parsing is performed.
   * @param {Partial<TypeFlowConfig>} [config={}]
   *   Optional configuration overrides. See {@link TypeFlowConfig} for the full
   *   option set. Merged with {@link TYPE_DEFAULTS}.
   * @returns {TypeFlowController}
   *   A controller object with a `stop()` method and a `promise` that resolves
   *   to `{ completed: boolean, text: string }`.
   *
   * @example
   * const controller = TypeFlow.type('#headline', 'Hello <strong>World</strong>', {
   *   html: true,
   *   speed: 45,
   *   cursor: '|',
   *   cursorBlink: true,
   *   onComplete: (text) => console.log('Done:', text),
   * });
   *
   * // Abort mid-animation
   * button.addEventListener('click', () => controller.stop());
   */
  type(target, text, config = {}) {
    const el = resolveTarget(target);
    const options = { ...TYPE_DEFAULTS, ...config };
    options.direction = normalizeDirection(options.direction);
    options.typeStyle = normalizeTypeStyle(options.typeStyle);
    if (options.typeStyle === 'word') options.granularity = 'word';

    const allowedTags = new Set([...DEFAULT_ALLOWED_TAGS, ...(options.allowedTags ?? [])]);
    const allowedAttrs = { ...DEFAULT_ALLOWED_ATTRS };
    if (options.allowedAttributes) {
      for (const [tag, attrs] of Object.entries(options.allowedAttributes)) {
        allowedAttrs[tag] = new Set([...(allowedAttrs[tag] ?? []), ...attrs]);
      }
    }

    let sourceText = text === null ? '' : text === undefined ? '' : String(text);
    if (options.html && options.sanitizer) sourceText = options.sanitizer(sourceText);
    const sourceTree = buildSourceTree(sourceText, !options.html, allowedTags, allowedAttrs);
    const totalUnits = countTextUnits(sourceTree, options.granularity);

    const prefix = options.mode === 'append' ? Array.from(el.childNodes) : [];
    if (options.mode === 'append') this.baselines.set(el, prefix);
    else this.baselines.delete(el);

    if (WORD_MOTION_STYLES.has(options.typeStyle)) {
      return this.animateWordMotion(el, sourceTree, options, {
        prefix,
        resultText: sourceText,
        isErasing: false,
        motionKind: options.typeStyle,
      });
    }

    return this.animate(el, sourceTree, totalUnits, options, 0, totalUnits, sourceText, {
      prefix,
      blinkOnFinish: true,
      isErasing: false,
    });
  }

  erase(target, config = {}) {
    const el = resolveTarget(target);
    const options = { ...ERASE_DEFAULTS, ...config };
    options.eraseStyle = normalizeEraseStyle(options.eraseStyle);

    const baseline = options.preserveBaseline ? this.baselines.get(el) ?? [] : [];
    const allChildren = Array.from(el.childNodes);
    const erasableLive = baseline.length ? allChildren.filter((n) => !baseline.includes(n)) : allChildren;

    if (options.eraseStyle === 'instant') return this.instantClear(el, baseline, options);
    if (options.eraseStyle === 'fade') return this.eraseFade(el, erasableLive, baseline, options);

    const sourceTree = document.createDocumentFragment();
    erasableLive.forEach((n) => sourceTree.appendChild(n.cloneNode(true)));
    const totalUnits = countTextUnits(sourceTree, options.granularity);

    if (WORD_MOTION_STYLES.has(options.eraseStyle)) {
      return this.animateWordMotion(el, sourceTree, options, {
        prefix: baseline,
        isErasing: true,
        motionKind: options.eraseStyle,
      });
    }

    return this.animate(el, sourceTree, totalUnits, options, totalUnits, 0, '', {
      prefix: baseline,
      isErasing: true,
    });
  }

  /**
   * Smart Diff Morphing: compares the existing text content of `target` with `nextText`,
   * erases only the mismatched trailing characters, and types the replacement text.
   *
   * @param {Element | string} target - Target element or CSS selector string.
   * @param {string} nextText - Destination text.
   * @param {Partial<TypeFlowConfig>} [options={}] - Animation options.
   * @returns {Promise<{ completed: boolean, text: string }>}
   */
  morph(target, nextText, options = {}) {
    const el = resolveTarget(target);
    const currentText = el.textContent ?? '';
    const targetText = nextText === null ? '' : nextText === undefined ? '' : String(nextText);

    let prefixLen = 0;
    const max = Math.min(currentText.length, targetText.length);
    while (prefixLen < max && currentText[prefixLen] === targetText[prefixLen]) {
      prefixLen++;
    }

    const eraseCount = currentText.length - prefixLen;
    const appendText = targetText.slice(prefixLen);

    const steps = [];
    if (eraseCount > 0) {
      steps.push(
        seq.call(() => {
          const sourceTree = document.createDocumentFragment();
          sourceTree.appendChild(document.createTextNode(currentText));
          const totalUnits = currentText.length;
          return this.animate(
            el,
            sourceTree,
            totalUnits,
            { ...ERASE_DEFAULTS, ...options, speed: options.eraseSpeed ?? options.speed ?? ERASE_DEFAULTS.speed },
            totalUnits,
            prefixLen,
            currentText.slice(0, prefixLen),
            { prefix: [], isErasing: true }
          ).promise;
        })
      );
    }
    if (appendText.length > 0) {
      steps.push(
        seq.type(el, appendText, {
          ...options,
          mode: 'append',
        })
      );
    }

    return this.sequence(steps);
  }

  /**
   * Creates a streaming chunk consumer for real-time LLM token ingestion.
   *
   * @param {Element | string} target - Target element or CSS selector.
   * @param {Partial<TypeFlowConfig> & { onChunk?: (chunk: string, fullText: string) => void }} [options={}]
   * @returns {{ push: (chunk: string) => void, stop: () => void, clear: () => void }}
   */
  stream(target, options = {}) {
    const el = resolveTarget(target);
    let queue = [];
    let isProcessing = false;

    const processNext = () => {
      if (queue.length === 0) {
        isProcessing = false;
        return;
      }
      isProcessing = true;
      const chunk = queue.shift();
      this.type(el, chunk, {
        ...options,
        mode: 'append',
        onComplete: (text) => {
          options.onChunk?.(chunk, text);
          processNext();
        },
      });
    };

    return {
      push: (chunk) => {
        if (chunk !== null && chunk !== undefined && String(chunk).length > 0) {
          queue.push(String(chunk));
          if (!isProcessing) processNext();
        }
      },
      stop: () => {
        queue = [];
        this.stop(el);
        isProcessing = false;
      },
      clear: () => {
        queue = [];
        this.stop(el);
        isProcessing = false;
        el.replaceChildren();
      },
    };
  }

  /**
   * Returns a complete pre-configured options object for common typewriter profiles.
   *
   * @param {'cyberpunk' | 'terminal' | 'writer' | 'matrix' | 'blocks' | 'subtle'} name
   * @param {Partial<TypeFlowConfig>} [overrides={}]
   * @returns {TypeFlowConfig}
   */
  preset(name, overrides = {}) {
    const base = PRESETS[name] ?? PRESETS.writer;
    return { ...base, ...overrides };
  }

  /**
   * Executes an ordered list of animation steps sequentially, waiting for each
   * step to complete before advancing to the next one.
   *
   * Supported step kinds (created via the {@link seq} helper):
   * - `seq.type(target, text, config)` — Types text into a target element.
   * - `seq.erase(target, config)`      — Erases content from a target element.
   * - `seq.pause(duration)`            — Waits `duration` milliseconds.
   * - `seq.call(fn)`                   — Invokes an async or sync function.
   * - `seq.visible(target, threshold)` — Waits until the target is visible.
   *
   * If any step's animation is interrupted (via `controller.stop()`), the
   * entire sequence halts immediately.
   *
   * @param {Array<SequenceStep>} steps
   *   An ordered array of step descriptors. Use the {@link seq} helper to
   *   construct them.
   * @param {{ repeat?: number, target?: Element | string }} [seqConfig={}]
   *   Optional sequence-level configuration.
   *   - `repeat` — Number of times to repeat the full sequence. Use `Infinity`
   *     for indefinite repetition. Defaults to `1`.
   *   - `target` — A default target element applied to steps that do not
   *     specify one individually.
   * @returns {TypeFlowController}
   *   A controller with `stop()` and a `promise` resolving to
   *   `{ completed: boolean, text: '' }`.
   *
   * @example
   * import { TypeFlow, seq } from '@staticcanvas/typeflow';
   *
   * TypeFlow.sequence([
   *   seq.type('#output', 'Step 1 complete.'),
   *   seq.pause(600),
   *   seq.call(() => triggerSoundEffect()),
   *   seq.erase('#output'),
   *   seq.type('#output', 'Step 2 starting...'),
   * ], { repeat: 1 });
   */
  sequence(steps, seqConfig = {}) {
    if (!Array.isArray(steps) || steps.length === 0) {
      return { stop: () => {}, promise: Promise.resolve({ completed: true, text: '' }) };
    }

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
          try {
            await step.fn();
          } catch (err) {
            console.error('TypeFlow: error in seq.call step:', err);
          }
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

  /**
   * Cyclically types and erases an array of strings in sequence.
   *
   * Internally delegates to {@link TypeFlowEngine#sequence}, constructing a
   * step list of: `type → pause (holdDuration) → erase → pause (pauseBetween)`
   * for each word.
   *
   * @param {Element | string} target
   *   A DOM element or a CSS selector string.
   * @param {string[]} words
   *   An ordered array of strings to rotate through.
   * @param {RotateConfig} [config={}]
   *   Optional rotation configuration.
   * @param {Partial<TypeFlowConfig>} [config.typeConfig={}]
   *   Config options applied to every `type` step.
   * @param {Partial<TypeFlowConfig>} [config.eraseConfig={}]
   *   Config options applied to every `erase` step.
   * @param {number} [config.holdDuration=1200]
   *   Milliseconds to hold each fully-typed word before erasing.
   * @param {number} [config.pauseBetween=200]
   *   Milliseconds to wait after erasing before typing the next word.
   * @param {number | typeof Infinity} [config.repeat=Infinity]
   *   Number of full rotation cycles. Use `Infinity` for indefinite rotation.
   * @returns {TypeFlowController}
   *   A controller with `stop()` and a resolving `promise`.
   *
   * @example
   * TypeFlow.rotate('#rotating', ['Fast', 'Lightweight', 'Reliable'], {
   *   holdDuration: 1200,
   *   pauseBetween: 200,
   *   repeat: Infinity,
   * });
   */
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

  /**
   * Staggers typing across multiple DOM elements with an offset delay between each item.
   *
   * @param {Element[] | NodeList | string} targets
   *   A CSS selector string matching multiple elements, or an array / NodeList of elements.
   * @param {string | string[] | ((el: Element, index: number) => string)} [textOrTexts]
   *   A string, an array of strings (one per target), or a resolver callback.
   *   If omitted, reads each element's existing textContent.
   * @param {Partial<TypeFlowConfig> & { stagger?: number }} [config={}]
   *   TypeFlow options merged with `stagger` offset delay in ms (default: `150`).
   * @returns {TypeFlowController}
   *
   * @example
   * TypeFlow.stagger('.prompt-line', [
   *   'npm install @staticcanvas/typeflow',
   *   'npm run build',
   *   'typeflow start --port=3000',
   *   'Ready on http://localhost:3000'
   * ], {
   *   speed: 30,
   *   stagger: 250,
   *   cursor: '|'
   * });
   */
  stagger(targets, textOrTexts, config = {}) {
    let elements = [];
    if (typeof targets === 'string') {
      elements = typeof document !== 'undefined' ? Array.from(document.querySelectorAll(targets)) : [];
    } else if (Array.isArray(targets)) {
      elements = targets.map((t) => { try { return resolveTarget(t); } catch { return null; } }).filter(Boolean);
    } else if (targets && typeof targets[Symbol.iterator] === 'function') {
      elements = Array.from(targets).map((t) => { try { return resolveTarget(t); } catch { return null; } }).filter(Boolean);
    } else {
      try {
        const single = resolveTarget(targets);
        if (single) elements = [single];
      } catch {
        // Ignore invalid targets while resolving a stagger collection.
      }
    }

    if (elements.length === 0) {
      return { stop: () => {}, promise: Promise.resolve({ completed: true, text: '' }) };
    }

    const staggerDelay = config.stagger ?? 150;
    const controllers = [];
    let stopped = false;

    const promises = elements.map((el, index) => {
      let text = '';
      if (typeof textOrTexts === 'function') {
        text = textOrTexts(el, index);
      } else if (Array.isArray(textOrTexts)) {
        text = textOrTexts[index] !== undefined ? textOrTexts[index] : '';
      } else if (typeof textOrTexts === 'string') {
        text = textOrTexts;
      } else {
        text = el.textContent || '';
      }

      const itemDelay = (config.delay ?? 0) + (index * staggerDelay);
      const itemConfig = { ...config, delay: itemDelay };
      const ctrl = this.type(el, text, itemConfig);
      controllers.push(ctrl);
      return ctrl.promise;
    });

    const combinedPromise = Promise.all(promises).then((results) => {
      const allCompleted = results.every((r) => r.completed);
      return {
        completed: !stopped && allCompleted,
        text: results.map((r) => r.text).join('\n'),
      };
    });

    return {
      stop: () => {
        stopped = true;
        controllers.forEach((c) => c.stop());
      },
      promise: combinedPromise,
    };
  }

  /**
   * Observes a DOM subtree for mutations and invokes `callback` whenever
   * elements matching `childSelector` are added to the tree. Also invokes the
   * callback immediately for any pre-existing matching elements inside
   * `container`.
   *
   * Useful for animating dynamically injected content (e.g. chat messages,
   * feed items, server-streamed responses) without polling.
   *
   * @param {Element | string} container
   *   The root element whose subtree is observed.
   * @param {string} childSelector
   *   A CSS selector string. Newly added elements matching this selector
   *   will trigger `callback`.
   * @param {(el: Element) => void} callback
   *   Function invoked with each matching element. Runs synchronously for
   *   pre-existing matches and on the microtask after each mutation.
   * @returns {{ disconnect: () => void }}
   *   An object with a `disconnect()` method that stops observation.
   *
   * @example
   * const watcher = TypeFlow.watch('#feed', '.item-title', (el) => {
   *   const text = el.textContent;
   *   el.textContent = '';
   *   TypeFlow.type(el, text, { speed: 20 });
   * });
   *
   * // Stop observing when the container is destroyed
   * watcher.disconnect();
   */
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

  /**
   * Layout stabilization helper that measures a list of rotating candidate
   * phrases and locks the target container's inline dimensions to prevent
   * Cumulative Layout Shift (CLS).
   *
   * @param {Element | string} target
   *   A DOM element or a CSS selector string.
   * @param {string[]} candidates
   *   An array of strings/phrases that will rotate inside this container.
   * @returns {void}
   *
   * @example
   * TypeFlow.fit('#slogan', ['short', 'very long phrase that wraps']);
   */
  fit(target, candidates = []) {
    const el = resolveTarget(target);
    if (!Array.isArray(candidates) || !candidates.length || typeof document === 'undefined') return;

    const probe = document.createElement('span');
    probe.style.cssText =
      'position:absolute;visibility:hidden;opacity:0;pointer-events:none;white-space:nowrap;';
    const cs = typeof window !== 'undefined' && window.getComputedStyle ? window.getComputedStyle(el) : null;
    if (cs) {
      probe.style.font = cs.font;
      probe.style.fontSize = cs.fontSize;
      probe.style.fontWeight = cs.fontWeight;
      probe.style.letterSpacing = cs.letterSpacing;
      probe.style.textTransform = cs.textTransform;
    }
    document.body.appendChild(probe);

    let maxW = 0;
    candidates.forEach((phrase) => {
      probe.textContent = String(phrase).replace(/<[^>]*>/g, '');
      maxW = Math.max(maxW, probe.getBoundingClientRect().width);
    });
    probe.remove();

    if (maxW > 0) {
      el.style.display = 'inline-block';
      el.style.minWidth = `${Math.ceil(maxW)}px`;
    }
  }

  /**
   * Stops any animation currently running on `target`. If no animation is
   * active on the element this method is a no-op.
   *
   * Equivalent to calling `controller.stop()` on the controller returned by
   * the originating `type()`, `erase()`, `sequence()`, or `rotate()` call.
   *
   * @param {Element | string} target - Target element or CSS selector string.
   * @returns {void}
   *
   * @example
   * TypeFlow.type('#el', 'Long text...');
   * // Stop from another handler without keeping a reference to the controller
   * TypeFlow.stop('#el');
   */
  stop(target) {
    const el = resolveTarget(target);
    if (!el) return;
    this.clearCursorInterval(el);
    this.active.get(el)?.stop();
  }

  /**
   * Stops all animations currently managed by this engine instance.
   *
   * @returns {void}
   *
   * @example
   * // Clean up all running animations on page unload
   * window.addEventListener('pagehide', () => TypeFlow.stopAll());
   */
  stopAll() {
    this.cursorIntervals.forEach((id) => clearInterval(id));
    this.cursorIntervals.clear();
    Array.from(this.active.values()).forEach((c) => c.stop());
  }

  /**
   * Returns `true` when `target` has an active animation managed by this
   * engine instance.
   *
   * @param {Element | string} target - Target element or CSS selector string.
   * @returns {boolean}
   *
   * @example
   * if (!TypeFlow.isTyping('#el')) {
   *   TypeFlow.type('#el', 'Now available.');
   * }
   */
  isTyping(target) {
    const el = resolveMaybeTarget(target);
    return !!el && this.active.has(el);
  }
}

// ============================================================
// Vanilla Public API (Singleton)
// ============================================================

/**
 * The global singleton instance of {@link TypeFlowEngine}.
 *
 * Import this in ESM environments:
 * ```javascript
 * import { TypeFlow } from '@staticcanvas/typeflow';
 * ```
 *
 * In UMD/script-tag environments the singleton is available as `window.TypeFlow`.
 *
 * @type {TypeFlowEngine}
 */
export const TypeFlow = new TypeFlowEngine();
export default TypeFlow;

/**
 * Factory helpers for constructing {@link TypeFlowEngine#sequence} step
 * descriptors. Use these instead of building plain objects manually to ensure
 * correct `kind` values and type safety.
 *
 * @namespace seq
 *
 * @example
 * import { TypeFlow, seq } from '@staticcanvas/typeflow';
 *
 * TypeFlow.sequence([
 *   seq.type('#out', 'Hello.'),
 *   seq.pause(500),
 *   seq.erase('#out'),
 * ]);
 */
export const seq = {
  /**
   * Creates a `type` step that types `text` into `target`.
   * @param {Element | string} target
   * @param {string} [text='']
   * @param {Partial<TypeFlowConfig>} [config]
   * @returns {SequenceStep}
   */
  type: (target, text = '', config) => ({ kind: 'type', target, text, config }),

  /**
   * Creates an `erase` step that erases content from `target`.
   * @param {Element | string} target
   * @param {Partial<TypeFlowConfig>} [config]
   * @returns {SequenceStep}
   */
  erase: (target, config) => ({ kind: 'erase', target, config }),

  /**
   * Creates a `pause` step that waits `duration` milliseconds.
   * @param {number} duration - Wait time in milliseconds.
   * @returns {SequenceStep}
   */
  pause: (duration) => ({ kind: 'pause', duration }),

  /**
   * Creates a `visible` step that waits until `target` enters the viewport.
   * @param {Element | string} target
   * @param {number} [threshold=0.1] - Intersection threshold (0–1).
   * @returns {SequenceStep}
   */
  visible: (target, threshold) => ({ kind: 'visible', target, threshold }),

  /**
   * Creates a `call` step that invokes `fn`. May be async.
   * @param {() => void | Promise<void>} fn
   * @returns {SequenceStep}
   */
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

// ============================================================
// Alpine.js Adapter
// ============================================================

export function createTypeFlowAlpine(Alpine) {
  if (!Alpine || typeof Alpine.directive !== 'function') {
    throw new Error('[TypeFlow] createTypeFlowAlpine requires an Alpine instance with directive() support.');
  }

  Alpine.directive('typeflow', (el, { expression }, { evaluateLater, effect, cleanup }) => {
    const evaluate = evaluateLater(expression);
    let controller = null;

    effect(() => {
      evaluate((value) => {
        controller?.stop();
        if (value === null || value === undefined) return;
        const text = typeof value === 'object' && value !== null ? (value.text ?? '') : String(value);
        const config = typeof value === 'object' && value !== null ? (value.config ?? {}) : {};
        controller = TypeFlow.type(el, text, config);
      });
    });

    if (typeof cleanup === 'function') {
      cleanup(() => controller?.stop());
    }
  });
}

// ============================================================
// Web Components / Custom Element Adapter
// ============================================================

export function defineTypeFlowElement(customElementsRegistry = typeof customElements !== 'undefined' ? customElements : null) {
  if (!customElementsRegistry || customElementsRegistry.get('type-flow')) return;

  class TypeFlowCustomElement extends HTMLElement {
    #controller = null;

    static get observedAttributes() {
      return ['text', 'speed', 'direction', 'cursor', 'type-style', 'erase-style', 'scramble-charset', 'audio'];
    }

    connectedCallback() {
      this.#render();
    }

    disconnectedCallback() {
      this.#controller?.stop();
    }

    attributeChangedCallback(_name, oldValue, newValue) {
      if (this.isConnected && oldValue !== newValue) {
        this.#render();
      }
    }

    #render() {
      this.#controller?.stop();
      const text = this.getAttribute('text') ?? this.textContent ?? '';
      const speed = this.hasAttribute('speed') ? Number(this.getAttribute('speed')) : 40;
      const direction = this.getAttribute('direction') || 'left';
      const cursor = this.getAttribute('cursor') ?? '|';
      const typeStyle = this.getAttribute('type-style') || 'char';
      const eraseStyle = this.getAttribute('erase-style') || 'end';
      const scrambleCharset = this.getAttribute('scramble-charset') || 'matrix';
      const audio = this.getAttribute('audio') || undefined;

      this.#controller = TypeFlow.type(this, text, {
        speed,
        direction,
        cursor,
        typeStyle,
        eraseStyle,
        scrambleCharset,
        audio,
      });
    }

    stop() {
      this.#controller?.stop();
    }
  }

  customElementsRegistry.define('type-flow', TypeFlowCustomElement);
}
