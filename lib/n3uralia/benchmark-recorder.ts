import { createHash, randomUUID } from 'node:crypto';
import type { EngineContext } from './context';
import type { PipelineRunResult } from './pipeline-scheduler';

export interface BenchmarkEnvironment {
  runtime: 'node';
  nodeVersion: string;
  platform: NodeJS.Platform;
  architecture: string;
}

export interface BenchmarkRecord {
  id: string;
  createdAt: string;
  engineVersion: string;
  model: string;
  presetId?: string;
  qualityTarget: string;
  scaleFactor: number;
  input: {
    checksum: string;
    bytes: number;
    resolution?: string;
    megapixels?: number;
  };
  output: {
    checksum: string;
    bytes: number;
    width?: number;
    height?: number;
    format?: string;
  };
  metrics: EngineContext['metrics'];
  timings: EngineContext['timings'];
  pipeline?: PipelineRunResult;
  environment: BenchmarkEnvironment;
}

export function createBenchmarkRecord(
  context: EngineContext,
  pipeline?: PipelineRunResult,
): BenchmarkRecord {
  if (!context.analysis) {
    throw new Error('Cannot record benchmark without analysis');
  }
  if (!context.strategy) {
    throw new Error('Cannot record benchmark without strategy');
  }
  if (!context.enhancement) {
    throw new Error('Cannot record benchmark without enhancement output');
  }
  if (!context.metrics) {
    throw new Error('Cannot record benchmark without measured metrics');
  }

  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    engineVersion: context.engineVersion,
    model: context.strategy.model,
    presetId: context.strategy.presetId,
    qualityTarget: context.strategy.qualityTarget,
    scaleFactor: context.strategy.scaleFactor,
    input: {
      checksum: checksum(context.originalBuffer),
      bytes: context.originalSize,
      resolution: context.analysis.resolution,
      megapixels: context.analysis.megapixels,
    },
    output: {
      checksum: checksum(context.workingBuffer),
      bytes: context.workingBuffer.length,
      width: context.enhancement.width,
      height: context.enhancement.height,
      format: context.enhancement.format,
    },
    metrics: context.metrics,
    timings: context.timings.map((timing) => ({ ...timing })),
    pipeline,
    environment: {
      runtime: 'node',
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
    },
  };
}

export function serializeBenchmarkRecord(record: BenchmarkRecord): string {
  return JSON.stringify(record, null, 2);
}

export function checksum(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
