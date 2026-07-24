/**
 * Strategy Selector - Choose optimal enhancement approach
 */

import type { ImageAnalysis, EnhancementStrategy } from './engine';

export function selectStrategy(
  analysis: ImageAnalysis,
  options?: {
    scaleFactor?: number;
    qualityTarget?: 'speed' | 'balanced' | 'quality';
    presetId?: string;
  }
): EnhancementStrategy {
  const scaleFactor = options?.scaleFactor || getDefaultScaleFactor(analysis);
  const qualityTarget = options?.qualityTarget || 'balanced';
  const presetId = options?.presetId || getDefaultPresetId(analysis.detectedContent);

  // Select model based on detected content
  const model = selectModel(analysis.detectedContent);

  // Calculate preservation level based on original quality
  const preservationLevel = getPreservationLevel(analysis.quality);

  return {
    name: getStrategyName(model, scaleFactor),
    model,
    scaleFactor,
    preservationLevel,
    qualityTarget,
    presetId,
  };
}

function getDefaultScaleFactor(analysis: ImageAnalysis): number {
  switch (analysis.quality) {
    case 'low':
      return 4;
    case 'medium':
      return 4;
    case 'high':
      return 2;
    case 'ultra':
      return 2;
    default:
      return 2;
  }
}

function selectModel(detectedContent: string[]): string {
  // Logic to select the best model based on content detection
  if (detectedContent.some(c => c === 'Architecture' || c === 'Interior')) {
    return 'Architecture v1';
  }
  if (detectedContent.some(c => c === 'Face' || c === 'Portrait')) {
    return 'Face Restoration';
  }
  if (detectedContent.some(c => c === 'Nature' || c === 'Landscape')) {
    return 'Nature Enhanced';
  }
  return 'Full Spectrum';
}

function getPreservationLevel(quality: 'low' | 'medium' | 'high' | 'ultra'): number {
  switch (quality) {
    case 'low':
      return 0.7;
    case 'medium':
      return 0.8;
    case 'high':
      return 0.9;
    case 'ultra':
      return 0.95;
    default:
      return 0.85;
  }
}

function getStrategyName(model: string, scaleFactor: number): string {
  return `${model} - ${scaleFactor}x Upscale`;
}

function getDefaultPresetId(detectedContent: string[]): string {
  // Map detected content to appropriate Philz preset
  if (detectedContent.some(c => c === 'Face' || c === 'Portrait')) {
    return 'portrait';
  }
  if (detectedContent.some(c => c === 'Architecture' || c === 'Interior')) {
    return 'architecture';
  }
  if (detectedContent.some(c => c === 'Nature' || c === 'Landscape')) {
    return 'nature';
  }
  return 'full_spectrum';
}
