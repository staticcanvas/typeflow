/**
 * TypeFlow Metrics - Real-time Performance HUD & Diagnostic Tooltip.
 */
export interface TypeFlowMetricsOptions {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  detailed?: boolean;
  autoTrack?: boolean;
  updateInterval?: number;
  zIndex?: number;
}

export interface TypeFlowMetricsSnapshot {
  timestamp: string;
  fps: number;
  activeInstances: number;
  totalTyped: number;
  totalErased: number;
  domMutations: number;
  interruptions: number;
  uptimeSeconds: number;
}

export class TypeFlowMetrics {
  static instance: TypeFlowMetrics | null;
  static mount(options?: TypeFlowMetricsOptions): TypeFlowMetrics;
  static unmount(): void;
  static getStats(): TypeFlowMetricsSnapshot | null;

  constructor(options?: TypeFlowMetricsOptions);
  toggleModal(forceState?: boolean): void;
  recordTyped(count?: number): void;
  recordErased(count?: number): void;
  recordInterruption(): void;
  resetStats(): void;
  copyStats(): void;
  getSnapshot(): TypeFlowMetricsSnapshot;
  destroy(): void;
}
