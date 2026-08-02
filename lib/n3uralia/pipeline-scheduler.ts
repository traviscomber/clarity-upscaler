import type { EngineContext, EngineStage } from './context';
import { runEngineStage } from './context';

export interface PipelineStep<T = unknown> {
  id: string;
  stage: EngineStage;
  enabled?: (context: EngineContext) => boolean;
  execute: (context: EngineContext) => Promise<T>;
  apply?: (context: EngineContext, result: T) => void;
}

export interface PipelineStepResult {
  id: string;
  stage: EngineStage;
  status: 'completed' | 'skipped' | 'failed';
  durationMs: number;
  error?: string;
}

export interface PipelineRunResult {
  startedAt: number;
  completedAt: number;
  durationMs: number;
  steps: PipelineStepResult[];
}

export async function runPipeline(
  context: EngineContext,
  steps: PipelineStep[],
): Promise<PipelineRunResult> {
  const startedAt = Date.now();
  const results: PipelineStepResult[] = [];
  const ids = new Set<string>();

  for (const step of steps) {
    if (!step.id.trim()) {
      throw new Error('Pipeline step id cannot be empty');
    }
    if (ids.has(step.id)) {
      throw new Error(`Duplicate pipeline step id: ${step.id}`);
    }
    ids.add(step.id);

    if (step.enabled && !step.enabled(context)) {
      results.push({
        id: step.id,
        stage: step.stage,
        status: 'skipped',
        durationMs: 0,
      });
      context.logs.push({
        timestamp: Date.now(),
        stage: step.stage,
        message: `${step.id} skipped`,
      });
      continue;
    }

    const stepStartedAt = Date.now();
    try {
      const output = await runEngineStage(context, step.stage, () =>
        step.execute(context),
      );
      step.apply?.(context, output);
      results.push({
        id: step.id,
        stage: step.stage,
        status: 'completed',
        durationMs: Date.now() - stepStartedAt,
      });
    } catch (error) {
      results.push({
        id: step.id,
        stage: step.stage,
        status: 'failed',
        durationMs: Date.now() - stepStartedAt,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  const completedAt = Date.now();
  return {
    startedAt,
    completedAt,
    durationMs: completedAt - startedAt,
    steps: results,
  };
}

export function validatePipeline(steps: PipelineStep[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const step of steps) {
    if (!step.id.trim()) errors.push('Pipeline step id cannot be empty');
    if (ids.has(step.id)) errors.push(`Duplicate pipeline step id: ${step.id}`);
    ids.add(step.id);
  }

  if (!steps.some((step) => step.stage === 'analysis')) {
    errors.push('Pipeline must include an analysis stage');
  }
  if (!steps.some((step) => step.stage === 'enhancement')) {
    errors.push('Pipeline must include an enhancement stage');
  }
  if (!steps.some((step) => step.stage === 'evaluation')) {
    errors.push('Pipeline must include an evaluation stage');
  }

  return errors;
}
