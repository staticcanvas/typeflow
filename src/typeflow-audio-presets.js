export const AUDIO_PRESET_SCHEMA_VERSION = 1;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const layer = (oscillator, start, end, gain, duration, extras = {}) => ({
  oscillator,
  frequency: { start, end },
  gain: { start: gain, end: 0.001 },
  duration,
  filter: extras.filter ?? null,
  detune: { base: extras.detune ?? 0, variance: extras.variance ?? 0.06 },
});

const preset = (type, erase) => ({
  version: AUDIO_PRESET_SCHEMA_VERSION,
  actions: { type, erase: erase ?? type },
});

export const AUDIO_PRESETS = freeze({
  'mechanical-blue': preset(
    [layer('triangle', 3400, 900, 0.18, 0.008), layer('sine', 200, 50, 0.32, 0.035)],
    [layer('triangle', 900, 180, 0.12, 0.025)]
  ),
  'mechanical-red': preset([layer('sine', 220, 70, 0.26, 0.028)], [layer('sine', 150, 55, 0.12, 0.022)]),
  'mechanical-brown': preset([layer('triangle', 240, 75, 0.27, 0.032)], [layer('triangle', 170, 60, 0.13, 0.024)]),
  'soft-keyboard': preset(
    [layer('sine', 520, 280, 0.08, 0.018, { filter: { type: 'lowpass', frequency: 1200, q: 0.7 } })],
    [layer('sine', 320, 180, 0.06, 0.016)]
  ),
  typewriter: preset([layer('square', 320, 90, 0.17, 0.022)], [layer('square', 180, 70, 0.13, 0.026)]),
  'terminal-beep': preset([layer('square', 880, 880, 0.08, 0.025)], [layer('square', 440, 330, 0.06, 0.03)]),
  synth: preset([layer('sawtooth', 950, 180, 0.12, 0.045)], [layer('sawtooth', 420, 120, 0.09, 0.04)]),
  correction: preset([layer('triangle', 360, 110, 0.1, 0.035)], [layer('triangle', 260, 80, 0.14, 0.045)]),
});

export const AUDIO_PRESET_ALIASES = freeze({
  clicky: 'mechanical-blue',
  mechanical: 'mechanical-red',
  tactile: 'mechanical-brown',
  teletype: 'typewriter',
  vintage: 'typewriter',
  'terminal-8bit': 'terminal-beep',
  '8bit': 'terminal-beep',
  beep: 'terminal-beep',
  'cyber-synth': 'synth',
  neon: 'synth',
  bubble: 'soft-keyboard',
  pop: 'soft-keyboard',
});

export function validateAudioPreset(config) {
  if (!config || config.version !== AUDIO_PRESET_SCHEMA_VERSION || !config.actions || typeof config.actions !== 'object') {
    throw new TypeError(`TypeFlowWebAudio: preset must use schema version ${AUDIO_PRESET_SCHEMA_VERSION}.`);
  }
  const output = { version: AUDIO_PRESET_SCHEMA_VERSION, actions: {} };
  for (const action of ['type', 'erase']) {
    const layers = config.actions[action];
    if (!Array.isArray(layers) || layers.length === 0 || layers.length > 4) {
      throw new TypeError(`TypeFlowWebAudio: actions.${action} must contain 1-4 oscillator layers.`);
    }
    output.actions[action] = layers.map((candidate) => {
      const oscillator = String(candidate.oscillator ?? 'sine');
      if (!['sine', 'square', 'sawtooth', 'triangle'].includes(oscillator)) throw new RangeError('TypeFlowWebAudio: invalid oscillator type.');
      const duration = Number(candidate.duration);
      const start = Number(candidate.frequency?.start);
      const end = Number(candidate.frequency?.end);
      const gainStart = Number(candidate.gain?.start);
      const gainEnd = Number(candidate.gain?.end);
      if (!(duration >= 0.001 && duration <= 2)) throw new RangeError('TypeFlowWebAudio: duration must be 0.001-2 seconds.');
      if (!(start >= 20 && start <= 20000 && end >= 20 && end <= 20000)) throw new RangeError('TypeFlowWebAudio: frequency must be 20-20000 Hz.');
      if (!(gainStart >= 0 && gainStart <= 1 && gainEnd > 0 && gainEnd <= 1)) throw new RangeError('TypeFlowWebAudio: gain must be within safe bounds.');
      const variance = Number(candidate.detune?.variance ?? 0);
      if (!(variance >= 0 && variance <= 0.5)) throw new RangeError('TypeFlowWebAudio: detune variance must be 0-0.5.');
      const filter = candidate.filter === null || candidate.filter === undefined ? null : {
        type: String(candidate.filter.type ?? 'lowpass'),
        frequency: Math.max(20, Math.min(20000, Number(candidate.filter.frequency) || 1000)),
        q: Math.max(0.0001, Math.min(1000, Number(candidate.filter.q) || 1)),
      };
      if (filter && !['lowpass', 'highpass', 'bandpass', 'notch'].includes(filter.type)) throw new RangeError('TypeFlowWebAudio: invalid filter type.');
      return { oscillator, frequency: { start, end }, gain: { start: gainStart, end: gainEnd }, duration, filter, detune: { base: Number(candidate.detune?.base) || 0, variance } };
    });
  }
  return freeze(output);
}
