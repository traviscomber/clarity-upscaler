/**
 * N3uralia Engine Interface
 * Deterministic image analysis, scheduled enhancement, and measured evaluation.
 */

import { analyzeImage } from './analyzer';
import {
  createBenchmarkRecord,
  type BenchmarkRecord,
} from './benchmark-recorder';
import {
  createEngineContext,
  getStageDuration,
  type EngineLogEntry,
  type EngineTiming,
} from './context';
import {
  runPipeline,
  validatePipeline,
  type PipelineRunResult,
  type PipelineStep,
} from './pipeline-scheduler';
import {
  evaluateEnhancement,
  type EnhancementMetrics,
} from './quality';
import { selectStrategy } from './strategy';
import {
  runSuperResolution,
  type SuperResolutionBackendId,
  type SuperResolutionResult,
} from './super-resolution';

export interface ImageSignals {
  brightness: number;
  contrast: number;
  edgeDensity: number;
  darkClipping: number;
  highlightClipping: number;
}

export interface ImageAnalysis {
  resolution: string;
  megapixels: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  confidence: number;
  detectedContent: string[];
  recommendations: string[];
  recommendedPresetId?: string;
  recommendedPresetReason?: string;
  signals?: ImageSignals;
}

export interface EnhancementStrategy {
  name: string;
  model: string;
  scaleFactor: number;
  preservationLevel: number;
  qualityTarget: 'speed' | 'balanced' | 'quality';
  presetId?: string;
  creativity?: number;
  resemblance?: number;
  denoise_steps?: number;
  sharpen?: number;
  dynamic?: number;
  tile_overlap?: number;
  superResolutionBackend?: SuperResolutionBackendId;
}

export interface ProcessImageOptions {
  scaleFactor?: number;
  qualityTarget?: 'speed' | 'balanced' | 'quality';
  strategy?: EnhancementStrategy;
}

export interface EnhancementResult {
  analysis: ImageAnalysis;
  strategy: EnhancementStrategy;
  enhancement: SuperResolutionResult;
  metrics: EnhancementMetrics;
  benchmark: BenchmarkRecord;
  pipeline: PipelineRunResult;
  processingTime: number;
  enhancementTime: number;
  evaluationTime: number;
  originalSize: number;
  enhancedSize: number;
  engineVersion: 'n3uralia-core-v1';
  timings: EngineTiming[];
  logs: EngineLogEntry[];
}

function createDefaultPipeline(
  options?: ProcessImageOptions,
): PipelineStep[] {
  return [
    {
      id: 'analyze-image',
      stage: 'analysis',
      execute: (context) => analyzeImage(context.originalBuffer),
      apply: (context, result) => {
        context.analysis = result as ImageAnalysis;
      },
    },
    {
      id: 'plan-enhancement',
      stage: 'planning',
      execute: async (context) =>
        options?.strategy ??
        selectStrategy(context.analysis!, {
          scaleFactor: options?.scaleFactor,
          qualityTarget: options?.qualityTarget,
        }),
      apply: (context, result) => {
        context.strategy = result as EnhancementStrategy;
      },
    },
    {
      id: 'enhance-image',
      stage: 'enhancement',
      execute: (context) =>
        runSuperResolution({
          imageBuffer: context.workingBuffer,
          strategy: context.strategy!,
        }),
      apply: (context, result) => {
        const enhancement = result as SuperResolutionResult;
        context.enhancement = enhancement;
        context.workingBuffer = enhancement.buffer;
        context.logs.push({
          timestamp: Date.now(),
          stage: 'enhancement',
          message: enhancement.neural
            ? `Neural super-resolution completed with ${enhancement.backend}`
            : `Classical enhancement completed${
                enhancement.fallbackReason
                  ? `; fallback: ${enhancement.fallbackReason}`
                  : ''
              }`,
        });
      },
    },
    {
      id: 'evaluate-output',
      stage: 'evaluation',
      execute: (context) =>
        evaluateEnhancement(context.originalBuffer, context.workingBuffer),
      apply: (context, result) => {
        context.metrics = result as EnhancementMetrics;
      },
    },
  ];
}

export async function processImage(
  imageBuffer: Buffer,
  options?: ProcessImageOptions,
): Promise<EnhancementResult> {
  const context = createEngineContext(imageBuffer);
  const steps = createDefaultPipeline(options);
  const pipelineErrors = validatePipeline(steps);

  if (pipelineErrors.length > 0) {
    throw new Error(`Invalid engine pipeline: ${pipelineErrors.join('; ')}`);
  }

  const pipeline = await runPipeline(context, steps);

  if (
    !context.analysis ||
    !context.strategy ||
    !context.enhancement ||
    !context.metrics
  ) {
    throw new Error('Engine pipeline completed without all required outputs');
  }

  context.logs.push({
    timestamp: Date.now(),
    stage: 'complete',
    message: 'Engine pipeline completed',
  });

  const benchmark = createBenchmarkRecord(context, pipeline);

  return {
    analysis: context.analysis,
    strategy: context.strategy,
    enhancement: context.enhancement,
    metrics: context.metrics,
    benchmark,
    pipeline,
    processingTime: Date.now() - context.createdAt,
    enhancementTime: getStageDuration(context, 'enhancement'),
    evaluationTime: getStageDuration(context, 'evaluation'),
    originalSize: context.originalSize,
    enhancedSize: context.workingBuffer.length,
    engineVersion: context.engineVersion,
    timings: context.timings,
    logs: context.logs,
  };
}

export function getAvailableModels(): string[] {
  return [
    'Architecture v1',
    'Nature Enhanced',
    'Face Restoration',
    'Clean Detail',
    'Full Spectrum',
  ];
}

export function getPresets() {
  return {
    architecture: {
      name: 'Architecture Preservation',
      model: 'Architecture v1',
      scaleFactor: 2,
      qualityTarget: 'quality',
    },
    nature: {
      name: 'Nature Enhancement',
      model: 'Nature Enhanced',
      scaleFactor: 4,
      qualityTarget: 'balanced',
    },
    portrait: {
      name: 'Portrait & Face',
      model: 'Face Restoration',
      scaleFactor: 2,
      qualityTarget: 'quality',
    },
    fast: {
      name: 'Fast Enhancement',
      model: 'Clean Detail',
      scaleFactor: 2,
      qualityTarget: 'speed',
    },
  };
}
