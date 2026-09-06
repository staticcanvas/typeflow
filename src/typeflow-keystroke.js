/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
 * @description TypeFlow Keystroke - Human Cadence, Finger Distance & Typo Simulation Engine.
 * Models physical QWERTY coordinate finger travel, burstiness, thought pauses,
 * fatigue deceleration, and realistic typo injection with backspace auto-correction.
 *
 * @module @staticcanvas/typeflow/keystroke
 */

// QWERTY keyboard physical coordinates (row, col)
const QWERTY_COORDS = {
  '`': [0, 0],
  1: [0, 1],
  2: [0, 2],
  3: [0, 3],
  4: [0, 4],
  5: [0, 5],
  6: [0, 6],
  7: [0, 7],
  8: [0, 8],
  9: [0, 9],
  0: [0, 10],
  '-': [0, 11],
  '=': [0, 12],
  q: [1, 1.5],
  w: [1, 2.5],
  e: [1, 3.5],
  r: [1, 4.5],
  t: [1, 5.5],
  y: [1, 6.5],
  u: [1, 7.5],
  i: [1, 8.5],
  o: [1, 9.5],
  p: [1, 10.5],
  '[': [1, 11.5],
  ']': [1, 12.5],
  a: [2, 1.8],
  s: [2, 2.8],
  d: [2, 3.8],
  f: [2, 4.8],
  g: [2, 5.8],
  h: [2, 6.8],
  j: [2, 7.8],
  k: [2, 8.8],
  l: [2, 9.8],
  ';': [2, 10.8],
  "'": [2, 11.8],
  z: [3, 2.2],
  x: [3, 3.2],
  c: [3, 4.2],
  v: [3, 5.2],
  b: [3, 6.2],
  n: [3, 7.2],
  m: [3, 8.2],
  ',': [3, 9.2],
  '.': [3, 10.2],
  '/': [3, 11.2],
  ' ': [4, 6.0],
};

// Adjacent key neighborhood for realistic typo generation
const QWERTY_NEIGHBORS = {
  a: ['s', 'q', 'z', 'w'],
  b: ['v', 'g', 'h', 'n'],
  c: ['x', 'd', 'f', 'v'],
  d: ['s', 'e', 'r', 'f', 'c', 'x'],
  e: ['w', 's', 'd', 'r'],
  f: ['d', 'r', 't', 'g', 'v', 'c'],
  g: ['f', 't', 'y', 'h', 'b', 'v'],
  h: ['g', 'y', 'u', 'j', 'n', 'b'],
  i: ['u', 'j', 'k', 'o'],
  j: ['h', 'u', 'i', 'k', 'm', 'n'],
  k: ['j', 'i', 'o', 'l', 'm'],
  l: ['k', 'o', 'p', ';'],
  m: ['n', 'j', 'k'],
  n: ['b', 'h', 'j', 'm'],
  o: ['i', 'k', 'l', 'p'],
  p: ['o', 'l', '['],
  q: ['1', '2', 'w', 'a'],
  r: ['e', 'd', 'f', 't'],
  s: ['a', 'w', 'e', 'd', 'x', 'z'],
  t: ['r', 'f', 'g', 'y'],
  u: ['y', 'h', 'j', 'i'],
  v: ['c', 'f', 'g', 'b'],
  w: ['q', 'a', 's', 'e'],
  x: ['z', 's', 'd', 'c'],
  y: ['t', 'g', 'h', 'u'],
  z: ['a', 's', 'x'],
};

/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
 * @description Calculates Euclidean physical key distance on a standard QWERTY keyboard layout.
 * @param {string} keyA - Starting character or key.
 * @param {string} keyB - Target character or key.
 * @returns {number} Physical distance in key coordinate units (approx 1.0 to 12.0).
 *
 * -------------
 *
 * @Properties
 * @param {string} keyA - First key name or character.
 * @param {string} keyB - Second key name or character.
 *
 * -------------
 *
 * @example
 * const distAdjacent = calculateKeyDistance('e', 'r'); // ~1.0
 * const distFar = calculateKeyDistance('q', 'p'); // ~9.0
 */
export function calculateKeyDistance(keyA, keyB) {
  const a = QWERTY_COORDS[String(keyA).toLowerCase()] || [2, 5];
  const b = QWERTY_COORDS[String(keyB).toLowerCase()] || [2, 5];
  const dy = b[0] - a[0];
  const dx = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
}

export class TypeFlowKeystroke {
  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Computes dynamic typing delay between two consecutive characters based on physical distance, fatigue, and punctuation.
   * @param {string} prevChar - Previously typed character.
   * @param {string} nextChar - Character about to be typed.
   * @param {Object} [options={}] - Cadence calculation options.
   * @returns {number} Calculated delay in milliseconds.
   *
   * -------------
   *
   * @Properties
   * @param {string} prevChar - The last typed character.
   * @param {string} nextChar - The next character to type.
   * @param {number} [options.baseSpeed=45] - Base typing speed in milliseconds per unit.
   * @param {number} [options.fatigueIndex=0] - Character index counter in active passage.
   * @param {number} [options.fatigueRate=0.0001] - Gradual deceleration coefficient per character.
   *
   * -------------
   *
   * @example
   * const delay = TypeFlowKeystroke.getDelay('a', 'b', { baseSpeed: 40 });
   * const pauseAfterPeriod = TypeFlowKeystroke.getDelay('.', 'T', { baseSpeed: 40 });
   */
  static getDelay(prevChar, nextChar, options = {}) {
    const base = options.baseSpeed || 45;
    const fatigue = 1 + (options.fatigueIndex || 0) * (options.fatigueRate || 0.0001);

    // 1. Distance multiplier (farther keys take slightly longer)
    const dist = calculateKeyDistance(prevChar, nextChar);
    const distFactor = 1 + Math.min(0.6, dist * 0.06);

    // 2. Natural Punctuation Hesitations
    let pause = 0;
    if (prevChar === '.' || prevChar === '!' || prevChar === '?') pause = 240;
    else if (prevChar === ',' || prevChar === ';' || prevChar === ':') pause = 120;
    else if (prevChar === ' ' || prevChar === '\n') pause = 35;

    // 3. Random Gaussian jitter (±15%)
    const jitter = 0.85 + Math.random() * 0.3;

    return Math.round((base * distFactor * fatigue + pause) * jitter);
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Transforms plain text into a sequence of typing, hesitation pauses, adjacent-key typos, and backspace corrections.
   * @param {string} text - Source text string to humanize.
   * @param {Object} [options={}] - Typo and cadence simulation settings.
   * @returns {Array<Object>} List of step actions ({ type: 'type' | 'erase' | 'pause', char?, duration?, isTypo? }).
   *
   * -------------
   *
   * @Properties
   * @param {string} text - The input text.
   * @param {number} [options.errorRate=0.04] - Probability of introducing an adjacent-key typo (0.04 = 4%).
   * @param {number} [options.hesitationMs=180] - Pause duration in ms when a typo is made before backspacing.
   *
   * -------------
   *
   * @example
   * const actions = TypeFlowKeystroke.humanize('Fast, resilient, zero dependencies.', {
   *   errorRate: 0.05,
   *   hesitationMs: 200,
   * });
   */
  static humanize(text, options = {}) {
    const errorRate = options.errorRate ?? 0.04;
    const actions = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const lower = char.toLowerCase();
      const neighbors = QWERTY_NEIGHBORS[lower];

      // Introduce typo if character has neighbors and probability hits
      if (
        neighbors &&
        neighbors.length > 0 &&
        Math.random() < errorRate &&
        char !== ' ' &&
        char !== '\n'
      ) {
        const typoChar = neighbors[Math.floor(Math.random() * neighbors.length)];
        const isUpper = char !== lower;
        const insertedTypo = isUpper ? typoChar.toUpperCase() : typoChar;

        // 1. Type the typo
        actions.push({ type: 'type', char: insertedTypo, isTypo: true });
        // 2. Realize mistake hesitation
        actions.push({ type: 'pause', duration: options.hesitationMs || 180 });
        // 3. Backspace typo
        actions.push({ type: 'erase', count: 1 });
        // 4. Type correct character
        actions.push({ type: 'type', char, isTypo: false });
      } else {
        actions.push({ type: 'type', char, isTypo: false });
      }
    }

    return actions;
  }
}

if (typeof window !== 'undefined') {
  window.TypeFlowKeystroke = TypeFlowKeystroke;
}
