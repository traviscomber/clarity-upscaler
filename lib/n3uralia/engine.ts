/**
 * N3uralia Engine Interface
 * Deterministic image analysis, enhancement orchestration, and evaluation.
 */

import { analyzeImage } from './analyzer';
import {
  createEngineContext,
  getStageDuration,
  runEngineStage,
  type EngineLogEntry,
  type EngineTiming,
} from './context';
import { enhanceImage } from './processing';
import {
  evaluateEnhancement,
  type EnhancementMetrics,
} from './quality';
import { selectStrategy } from './strategy';

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
}

export interface EnhancementResult {
  analysis: ImageAnalysis;
  strategy: EnhancementStrategy;
  metrics: EnhancementMetrics;
  processingTime: number;
  enhancementTime: number;
  evaluationTime: number;
  originalSize: number;
  enhancedSize: number;
  engineVersion: 'n3uralia-core-v1';
  timings: EngineTiming[];
  logs: EngineLogEntry[];
}

export async function processImage(
  imageBuffer: Buffer,
  options?: {
    scaleFactor?: number;
    qualityTarget?: 'speed' | 'balanced' | 'quality';
  },
): Promise<EnhancementResult> {
  const context = createEngineContext(imageBuffer);

  context.analysis = await runEngineStage(context, 'analysis', () =>
    analyzeImage(context.originalBuffer),
  );

  context.strategy = await runEngineStage(context, 'planning', async () =>
    selectStrategy(context.analysis!, options),
  );

  context.enhancement = await runEngineStage(context, 'enhancement', () =>
    enhanceImage(context.workingBuffer, context.strategy!),
  );
  context.workingBuffer = context.enhancement.buffer;

  context.metrics = await runEngineStage(context, 'evaluation', () =>
    evaluateEnhancement(context.originalBuffer, context.workingBuffer),
  );

  context.logs.push({
    timestamp: Date.now(),
    stage: 'complete',
    message: 'Engine pipeline completed',
  });

  return {
    analysis: context.analysis,
    strategy: context.strategy,
    metrics: context.metrics,
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
