/**
 * TypeFlow Keystroke - Human Cadence, Finger Distance & Typo Simulation Engine.
 */
export interface KeystrokeDelayOptions {
  baseSpeed?: number;
  fatigueIndex?: number;
  fatigueRate?: number;
}

export interface HumanizeOptions {
  errorRate?: number;
  hesitationMs?: number;
}

export interface HumanizeAction {
  type: 'type' | 'erase' | 'pause';
  char?: string;
  count?: number;
  duration?: number;
  isTypo?: boolean;
}

export function calculateKeyDistance(keyA: string, keyB: string): number;

export class TypeFlowKeystroke {
  static getDelay(prevChar: string, nextChar: string, options?: KeystrokeDelayOptions): number;
  static humanize(text: string, options?: HumanizeOptions): HumanizeAction[];
}
