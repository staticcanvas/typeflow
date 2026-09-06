/**
 * TypeFlow WebAudio - Procedural Audio Synthesis for Typing Interfaces.
 */
export type WebAudioProfile =
  | 'mechanical-blue'
  | 'clicky'
  | 'mechanical-red'
  | 'mechanical-brown'
  | 'tactile'
  | 'mechanical'
  | 'teletype'
  | 'vintage'
  | 'typewriter'
  | 'cyber-synth'
  | 'synth'
  | 'neon'
  | 'terminal-8bit'
  | '8bit'
  | 'beep'
  | 'bubble'
  | 'pop';

export interface WebAudioPlayOptions {
  char?: string;
  pan?: number;
  pitchVariance?: number;
  action?: 'type' | 'erase';
  /** Suppress keystrokes when prefers-reduced-motion is active. Default: false. */
  respectReducedMotion?: boolean;
}

export interface KeystrokeAudioCallback {
  (): void;
  /** Stops and disconnects voices created by this callback only. */
  stop(): void;
}

export interface AudioPresetLayer {
  oscillator: OscillatorType;
  frequency: { start: number; end: number };
  gain: { start: number; end: number };
  duration: number;
  filter: { type: BiquadFilterType; frequency: number; q: number } | null;
  detune: { base: number; variance: number };
}

export interface AudioPreset {
  version: 1;
  actions: { type: AudioPresetLayer[]; erase: AudioPresetLayer[] };
}

export const AUDIO_PRESET_SCHEMA_VERSION: 1;
export const AUDIO_PRESETS: Readonly<Record<string, AudioPreset>>;
export const AUDIO_PRESET_ALIASES: Readonly<Record<string, string>>;
export function validateAudioPreset(config: AudioPreset): Readonly<AudioPreset>;

export class TypeFlowWebAudio {
  static ctx: AudioContext | null;
  static isMuted: boolean;
  static volume: number;
  static maxPolyphony: number;

  static getContext(): AudioContext | null;
  static setVolume(volume: number): void;
  static mute(force?: boolean): void;
  static play(profile?: WebAudioProfile | string, options?: WebAudioPlayOptions): void;
  static registerAudioPreset(name: string, config: AudioPreset, options?: { overwrite?: boolean }): string;
  static removeAudioPreset(name: string): boolean;
  static resetAudioPresets(): void;
  static getAudioPreset(name: string): Readonly<AudioPreset> | null;
  static stopVoices(voices: Set<unknown>): void;
  static stopAll(): void;
  static destroy(): Promise<void>;
}

export function createKeystrokeAudio(profile?: WebAudioProfile | string, options?: WebAudioPlayOptions): KeystrokeAudioCallback;
