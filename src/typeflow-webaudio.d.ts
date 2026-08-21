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
}

export class TypeFlowWebAudio {
  static ctx: AudioContext | null;
  static isMuted: boolean;
  static volume: number;

  static getContext(): AudioContext | null;
  static setVolume(volume: number): void;
  static mute(force?: boolean): void;
  static play(profile?: WebAudioProfile | string, options?: WebAudioPlayOptions): void;
}

export function createKeystrokeAudio(profile?: WebAudioProfile | string, options?: WebAudioPlayOptions): () => void;
