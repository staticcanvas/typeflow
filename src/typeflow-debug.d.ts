/**
 * TypeFlow Debug - Diagnostic Tracing and LogCAD Integration.
 */
export interface TypeFlowDebugOptions {
  logcad?: boolean;
  console?: boolean;
  maxHistory?: number;
  traceFrames?: boolean;
}

export interface TypeFlowDebugEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'trace';
  message: string;
  data: Record<string, any>;
}

export class TypeFlowDebug {
  static enabled: boolean;
  static options: TypeFlowDebugOptions;
  static history: TypeFlowDebugEntry[];

  static enable(options?: TypeFlowDebugOptions): void;
  static disable(): void;
  static log(
    level: 'info' | 'warn' | 'error' | 'debug' | 'trace',
    message: string,
    data?: Record<string, any>
  ): void;
  static trace<T>(controller: T, label?: string): T;
  static getHistory(): TypeFlowDebugEntry[];
  static clearHistory(): void;
  static exportLog(): string;
}
