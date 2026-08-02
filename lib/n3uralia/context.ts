import type { EnhancementStrategy, ImageAnalysis } from './engine';
import type { EnhanceOutput } from './processing';
import type { EnhancementMetrics } from './quality';

export type EngineStage =
  | 'analysis'
  | 'planning'
  | 'enhancement'
  | 'evaluation'
  | 'complete';

export interface EngineTiming {
  stage: EngineStage;
  startedAt: number;
  completedAt: number;
  durationMs: number;
}

export interface EngineLogEntry {
  timestamp: number;
  stage: EngineStage;
  message: string;
}

export interface EngineContext {
  readonly engineVersion: 'n3uralia-core-v1';
  readonly createdAt: number;
  readonly originalBuffer: Buffer;
  readonly originalSize: number;
  workingBuffer: Buffer;
  analysis?: ImageAnalysis;
  strategy?: EnhancementStrategy;
  enhancement?: EnhanceOutput;
  metrics?: EnhancementMetrics;
  timings: EngineTiming[];
  logs: EngineLogEntry[];
}

export function createEngineContext(imageBuffer: Buffer): EngineContext {
  if (!imageBuffer?.length) {
    throw new Error('Cannot create an engine context without an image');
  }

  const createdAt = Date.now();

  return {
    engineVersion: 'n3uralia-core-v1',
    createdAt,
    originalBuffer: imageBuffer,
    originalSize: imageBuffer.length,
    workingBuffer: imageBuffer,
    timings: [],
    logs: [
      {
        timestamp: createdAt,
        stage: 'analysis',
        message: 'Engine context created',
      },
    ],
  };
}

export async function runEngineStage<T>(
  context: EngineContext,
  stage: EngineStage,
  operation: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  context.logs.push({
    timestamp: startedAt,
    stage,
    message: `${stage} started`,
  });

  try {
    const result = await operation();
    const completedAt = Date.now();

    context.timings.push({
      stage,
      startedAt,
      completedAt,
      durationMs: completedAt - startedAt,
    });
    context.logs.push({
      timestamp: completedAt,
      stage,
      message: `${stage} completed`,
    });

    return result;
  } catch (error) {
    const completedAt = Date.now();
    context.timings.push({
      stage,
      startedAt,
      completedAt,
      durationMs: completedAt - startedAt,
    });
    context.logs.push({
      timestamp: completedAt,
      stage,
      message: `${stage} failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    });
    throw error;
  }
}

export function getStageDuration(
  context: EngineContext,
  stage: EngineStage,
): number {
  return context.timings
    .filter((timing) => timing.stage === stage)
    .reduce((total, timing) => total + timing.durationMs, 0);
}
