import type { TypeFlowEngine, TypeFlowResult, TypeFlowStep } from './typeflow.js';

export interface TypeFlowParallelConfig {
  concurrency?: number;
  settlement?: 'fail-fast' | 'all-settled';
  target?: HTMLElement | string;
}
export type TypeFlowParallelStep = TypeFlowStep | { kind: 'parallel'; steps: TypeFlowParallelStep[]; options?: TypeFlowParallelConfig };
export type TypeFlowParallelStepResult =
  | { status: 'fulfilled' | 'interrupted'; value: TypeFlowResult | TypeFlowParallelResult }
  | { status: 'rejected'; reason: unknown };
export interface TypeFlowParallelResult extends TypeFlowResult { text: ''; results: TypeFlowParallelStepResult[] }
export interface TypeFlowParallelController { stop(): void; promise: Promise<TypeFlowParallelResult> }
export interface ExperimentalTypeFlowEngine extends TypeFlowEngine {
  parallel(steps: TypeFlowParallelStep[], options?: TypeFlowParallelConfig): TypeFlowParallelController;
}
export function parallelStep(steps: TypeFlowParallelStep[], options?: TypeFlowParallelConfig): TypeFlowParallelStep;
export function createParallel(engine: TypeFlowEngine): ExperimentalTypeFlowEngine['parallel'];
export function installParallel(engine: TypeFlowEngine, sequenceHelpers?: object): ExperimentalTypeFlowEngine;
