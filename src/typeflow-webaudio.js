/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
 * @description TypeFlow WebAudio - Procedural Audio Synthesis for Typing Interfaces.
 * Synthesizes zero-asset, real-time procedural keystrokes including mechanical switches,
 * vintage teletype strikes, retro terminal beeps, and FM cyber synths with spatial panning.
 *
 * @module @staticcanvas/typeflow/webaudio
 */

export class TypeFlowWebAudio {
  static ctx = null;
  static masterGain = null;
  static isMuted = false;
  static volume = 0.25;

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Initializes or returns the shared Web Audio Context singleton.
   * Automatically attaches unlock listeners to resume audio on the first user interaction.
   * @returns {AudioContext | null} The active AudioContext instance or null in non-browser environments.
   *
   * -------------
   *
   * @example
   * const ctx = TypeFlowWebAudio.getContext();
   * console.log('Audio state:', ctx?.state);
   */
  static getContext() {
    if (typeof window === 'undefined') return null;

    if (!TypeFlowWebAudio.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;

      TypeFlowWebAudio.ctx = new AudioCtx();
      TypeFlowWebAudio.masterGain = TypeFlowWebAudio.ctx.createGain();
      TypeFlowWebAudio.masterGain.gain.setValueAtTime(
        TypeFlowWebAudio.isMuted ? 0 : TypeFlowWebAudio.volume,
        TypeFlowWebAudio.ctx.currentTime
      );
      TypeFlowWebAudio.masterGain.connect(TypeFlowWebAudio.ctx.destination);

      // Unlock AudioContext on initial gesture if suspended
      const unlock = () => {
        if (TypeFlowWebAudio.ctx && TypeFlowWebAudio.ctx.state === 'suspended') {
          TypeFlowWebAudio.ctx.resume();
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    }

    if (TypeFlowWebAudio.ctx.state === 'suspended') {
      TypeFlowWebAudio.ctx.resume().catch(() => {});
    }

    return TypeFlowWebAudio.ctx;
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Sets the master volume level for synthesized keystrokes.
   * @param {number} vol - Volume level from 0.0 (silent) to 1.0 (maximum).
   * @returns {void}
   *
   * -------------
   *
   * @Properties
   * @param {number} vol - Floating-point number between 0.0 and 1.0.
   *
   * -------------
   *
   * @example
   * TypeFlowWebAudio.setVolume(0.15); // Set subtle background volume
   */
  static setVolume(vol) {
    TypeFlowWebAudio.volume = Math.max(0, Math.min(1, vol));
    if (TypeFlowWebAudio.masterGain && TypeFlowWebAudio.ctx && !TypeFlowWebAudio.isMuted) {
      TypeFlowWebAudio.masterGain.gain.setValueAtTime(TypeFlowWebAudio.volume, TypeFlowWebAudio.ctx.currentTime);
    }
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Toggles or forces the mute state of procedural keystroke audio.
   * @param {boolean} [force] - Optional boolean to explicitly force muted (true) or unmuted (false).
   * @returns {void}
   *
   * -------------
   *
   * @Properties
   * @param {boolean} [force] - If omitted, flips the current mute state.
   *
   * -------------
   *
   * @example
   * TypeFlowWebAudio.mute(); // Toggle mute
   * TypeFlowWebAudio.mute(true); // Force mute
   * TypeFlowWebAudio.mute(false); // Force unmute
   */
  static mute(force) {
    TypeFlowWebAudio.isMuted = force !== undefined ? force : !TypeFlowWebAudio.isMuted;
    if (TypeFlowWebAudio.masterGain && TypeFlowWebAudio.ctx) {
      TypeFlowWebAudio.masterGain.gain.setValueAtTime(
        TypeFlowWebAudio.isMuted ? 0 : TypeFlowWebAudio.volume,
        TypeFlowWebAudio.ctx.currentTime
      );
    }
  }

  /** * * * * * * * * * * * * * * * * * * * * * * * * * * **
   * @description Synthesizes and plays a procedural audio keystroke sound in real time without audio assets.
   * @param {string} [profile='mechanical-blue'] - Sound profile name ('mechanical-blue', 'mechanical-red', 'mechanical-brown', 'teletype', 'cyber-synth', 'terminal-8bit', 'bubble').
   * @param {Object} [options={}] - Keystroke playback parameters.
   * @returns {void}
   *
   * -------------
   *
   * @Properties
   * @param {string} [profile='mechanical-blue'] - Synthesizer profile.
   * @param {string} [options.char=' '] - Typed character (differentiates spacebar, return bells, normal keys).
   * @param {number} [options.pan=0] - Stereo pan from -1.0 (full left) to +1.0 (full right).
   * @param {number} [options.pitchVariance=0.06] - Organic pitch variation percentage (±0.06 = ±6%).
   *
   * -------------
   *
   * @example
   *
   * // Play a clicky switch sound
   * TypeFlowWebAudio.play('mechanical-blue');
   *
   * // Play a cyber synth keystroke panned slightly to the right
   * TypeFlowWebAudio.play('cyber-synth', { char: 'A', pan: 0.3 });
   *
   * // Play a teletype carriage bell on newline
   * TypeFlowWebAudio.play('teletype', { char: '\n' });
   */
  static play(profile = 'mechanical-blue', options = {}) {
    const ctx = TypeFlowWebAudio.getContext();
    if (!ctx || TypeFlowWebAudio.isMuted) return;

    const t = ctx.currentTime;
    const char = options.char || ' ';
    const jitter = 1 + (Math.random() * 2 - 1) * (options.pitchVariance ?? 0.06);

    // Optional spatial stereo panner
    let dest = TypeFlowWebAudio.masterGain;
    if (typeof ctx.createStereoPanner === 'function' && typeof options.pan === 'number') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, options.pan)), t);
      panner.connect(TypeFlowWebAudio.masterGain);
      dest = panner;
    }

    const normProfile = String(profile).toLowerCase();

    // 1. Mechanical Clicky Switch (Blue style)
    if (normProfile === 'mechanical-blue' || normProfile === 'clicky') {
      const isSpace = char === ' ' || char === '\n';
      const baseFreq = isSpace ? 140 : 200;

      // Click snap (high transient)
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime((isSpace ? 2800 : 3400) * jitter, t);
      snapGain.gain.setValueAtTime(0.2, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.008);
      snapOsc.connect(snapGain);
      snapGain.connect(dest);
      snapOsc.start(t);
      snapOsc.stop(t + 0.008);

      // Bottom-out thud (low resonant body)
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(baseFreq * jitter, t);
      thudOsc.frequency.exponentialRampToValueAtTime(50, t + 0.035);
      thudGain.gain.setValueAtTime(0.35, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      thudOsc.connect(thudGain);
      thudGain.connect(dest);
      thudOsc.start(t);
      thudOsc.stop(t + 0.035);
    }
    // 2. Mechanical Linear / Tactile (Red / Brown style)
    else if (normProfile === 'mechanical-red' || normProfile === 'mechanical-brown' || normProfile === 'tactile' || normProfile === 'mechanical') {
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = normProfile.includes('brown') ? 'triangle' : 'sine';
      thudOsc.frequency.setValueAtTime(220 * jitter, t);
      thudOsc.frequency.exponentialRampToValueAtTime(70, t + 0.028);
      thudGain.gain.setValueAtTime(0.28, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.028);
      thudOsc.connect(thudGain);
      thudGain.connect(dest);
      thudOsc.start(t);
      thudOsc.stop(t + 0.028);
    }
    // 3. Vintage Teletype / Solenoid Strike & Carriage Bell
    else if (normProfile === 'teletype' || normProfile === 'vintage' || normProfile === 'typewriter') {
      if (char === '\n') {
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(1760, t);
        bellGain.gain.setValueAtTime(0.3, t);
        bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        bellOsc.connect(bellGain);
        bellGain.connect(dest);
        bellOsc.start(t);
        bellOsc.stop(t + 0.35);
      } else {
        const clackOsc = ctx.createOscillator();
        const clackGain = ctx.createGain();
        clackOsc.type = 'square';
        clackOsc.frequency.setValueAtTime(320 * jitter, t);
        clackOsc.frequency.exponentialRampToValueAtTime(90, t + 0.022);
        clackGain.gain.setValueAtTime(0.18, t);
        clackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);
        clackOsc.connect(clackGain);
        clackGain.connect(dest);
        clackOsc.start(t);
        clackOsc.stop(t + 0.022);
      }
    }
    // 4. Sci-Fi Cyber Synth / Laser Chirp
    else if (normProfile === 'cyber-synth' || normProfile === 'synth' || normProfile === 'neon') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950 * jitter, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.045);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.045);
    }
    // 5. Retro 8-bit Terminal Beep
    else if (normProfile === 'terminal-8bit' || normProfile === '8bit' || normProfile === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime((char === ' ' ? 440 : 880) * jitter, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.025);
    }
    // 6. Liquid Bubble Pop
    else if (normProfile === 'bubble' || normProfile === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450 * jitter, t);
      osc.frequency.exponentialRampToValueAtTime(1100 * jitter, t + 0.03);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.035);
    }
  }
}

/** * * * * * * * * * * * * * * * * * * * * * * * * * * **
 * @description Creates an audio callback function configured for TypeFlow's `audio` option.
 * @param {string} [profile='mechanical-blue'] - Sound profile identifier.
 * @param {Object} [options={}] - Custom audio synthesis options.
 * @returns {() => void} Zero-argument callback function invoked per keystroke.
 *
 * -------------
 *
 * @Properties
 * @param {string} [profile='mechanical-blue'] - Sound profile name.
 * @param {number} [options.pan=0] - Stereo pan (-1.0 to 1.0).
 * @param {number} [options.pitchVariance=0.06] - Random pitch variance.
 *
 * -------------
 *
 * @example
 * import { TypeFlow } from '@staticcanvas/typeflow';
 * import { createKeystrokeAudio } from '@staticcanvas/typeflow/webaudio';
 *
 * TypeFlow.type('#headline', 'Mechanical Sound Effects', {
 *   audio: createKeystrokeAudio('mechanical-blue', { pan: 0.1 }),
 *   speed: 40,
 * });
 */
export function createKeystrokeAudio(profile = 'mechanical-blue', options = {}) {
  return () => {
    TypeFlowWebAudio.play(profile, options);
  };
}

if (typeof window !== 'undefined') {
  window.TypeFlowWebAudio = TypeFlowWebAudio;
  window.createKeystrokeAudio = createKeystrokeAudio;
}
