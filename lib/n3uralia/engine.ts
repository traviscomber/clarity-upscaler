/**
 * N3uralia Engine Interface
 * Deterministic image analysis, enhancement orchestration, and evaluation.
 */

import { analyzeImage } from './analyzer';
import { selectStrategy } from './strategy';
import { enhanceImage } from './processing';
import {
  evaluateEnhancement,
  type EnhancementMetrics,
} from './quality';

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
  originalSize: number;
  enhancedSize: number;
}

/** Process an image through analysis, planning, enhancement, and evaluation. */
export async function processImage(
  imageBuffer: Buffer,
  options?: {
    scaleFactor?: number;
    qualityTarget?: 'speed' | 'balanced' | 'quality';
  },
): Promise<EnhancementResult> {
  const startTime = Date.now();

  const analysis = await analyzeImage(imageBuffer);
  const strategy = selectStrategy(analysis, options);
  const enhanced = await enhanceImage(imageBuffer, strategy);
  const metrics = await evaluateEnhancement(imageBuffer, enhanced.buffer);

  return {
    analysis,
    strategy,
    metrics,
    processingTime: Date.now() - startTime,
    originalSize: imageBuffer.length,
    enhancedSize: enhanced.buffer.length,
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
