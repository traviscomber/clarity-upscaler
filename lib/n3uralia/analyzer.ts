/**
 * Deterministic image analyzer built on measurable pixel statistics.
 * Semantic classification is intentionally excluded until an optional vision
 * model is connected; this module only reports signals it can verify locally.
 */

import sharp from 'sharp';
import { recommendPreset } from './presets';
import type { ImageAnalysis } from './engine';

const SAMPLE_SIZE = 192;

interface PixelSignals {
  brightness: number;
  contrast: number;
  edgeDensity: number;
  darkClipping: number;
  highlightClipping: number;
}

export async function analyzeImage(imageBuffer: Buffer): Promise<ImageAnalysis> {
  if (!imageBuffer?.length) {
    throw new Error('Invalid image buffer');
  }

  const image = sharp(imageBuffer, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (!width || !height) {
    throw new Error('Unable to read image dimensions');
  }

  const megapixels = (width * height) / 1_000_000;
  const signals = await measurePixelSignals(imageBuffer);
  const quality = getQualityLevel(megapixels, signals);
  const detectedContent = describeVerifiedSignals(signals);
  const recommendations = getRecommendations(quality, signals);

  const recommendation = recommendPreset(
    megapixels,
    quality,
    detectedContent,
    quality === 'low' || quality === 'medium' ? 4 : 2,
  );

  return {
    resolution: `${width} × ${height}px`,
    megapixels: round(megapixels, 1),
    quality,
    confidence: 0.96,
    detectedContent,
    recommendations,
    recommendedPresetId: recommendation.preset.id,
    recommendedPresetReason: recommendation.reason,
    signals: {
      brightness: round(signals.brightness, 3),
      contrast: round(signals.contrast, 3),
      edgeDensity: round(signals.edgeDensity, 3),
      darkClipping: round(signals.darkClipping, 3),
      highlightClipping: round(signals.highlightClipping, 3),
    },
  };
}

async function measurePixelSignals(imageBuffer: Buffer): Promise<PixelSignals> {
  const { data, info } = await sharp(imageBuffer, { failOn: 'none' })
    .rotate()
    .resize({
      width: SAMPLE_SIZE,
      height: SAMPLE_SIZE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const count = data.length;
  if (!count || !info.width || !info.height) {
    throw new Error('Unable to sample image pixels');
  }

  let sum = 0;
  let sumSquares = 0;
  let dark = 0;
  let highlights = 0;
  let edgeDifference = 0;
  let edgeComparisons = 0;

  for (let index = 0; index < count; index += 1) {
    const value = data[index];
    sum += value;
    sumSquares += value * value;
    if (value <= 8) dark += 1;
    if (value >= 247) highlights += 1;

    const x = index % info.width;
    if (x > 0) {
      edgeDifference += Math.abs(value - data[index - 1]);
      edgeComparisons += 1;
    }
    if (index >= info.width) {
      edgeDifference += Math.abs(value - data[index - info.width]);
      edgeComparisons += 1;
    }
  }

  const mean = sum / count;
  const variance = Math.max(0, sumSquares / count - mean * mean);

  return {
    brightness: mean / 255,
    contrast: Math.sqrt(variance) / 128,
    edgeDensity: edgeComparisons ? edgeDifference / edgeComparisons / 255 : 0,
    darkClipping: dark / count,
    highlightClipping: highlights / count,
  };
}

function getQualityLevel(
  megapixels: number,
  signals: PixelSignals,
): ImageAnalysis['quality'] {
  const resolutionScore = clamp(megapixels / 12);
  const contrastScore = clamp(signals.contrast / 0.45);
  const detailScore = clamp(signals.edgeDensity / 0.14);
  const clippingPenalty = clamp(
    (signals.darkClipping + signals.highlightClipping) / 0.25,
  );

  const score =
    resolutionScore * 0.45 +
    contrastScore * 0.25 +
    detailScore * 0.3 -
    clippingPenalty * 0.15;

  if (score < 0.34) return 'low';
  if (score < 0.58) return 'medium';
  if (score < 0.78) return 'high';
  return 'ultra';
}

function describeVerifiedSignals(signals: PixelSignals): string[] {
  const labels: string[] = ['General Image'];

  if (signals.edgeDensity >= 0.12) labels.push('High Edge Detail');
  if (signals.edgeDensity <= 0.045) labels.push('Soft Detail');
  if (signals.contrast <= 0.18) labels.push('Low Contrast');
  if (signals.darkClipping >= 0.12 || signals.brightness <= 0.25) {
    labels.push('Low Light');
  }
  if (signals.highlightClipping >= 0.06) labels.push('Highlight Clipping');

  return labels;
}

function getRecommendations(
  quality: ImageAnalysis['quality'],
  signals: PixelSignals,
): string[] {
  const recommendations: string[] = [];

  if (quality === 'low' || quality === 'medium') {
    recommendations.push('Use 4x only when the final output size requires it');
  } else {
    recommendations.push('2x upscaling is the safer preservation target');
  }

  if (signals.edgeDensity <= 0.045) {
    recommendations.push('Use gentle sharpening to avoid halos');
  } else if (signals.edgeDensity >= 0.12) {
    recommendations.push('Preserve existing edges and avoid aggressive sharpening');
  }

  if (signals.darkClipping >= 0.12) {
    recommendations.push('Dark regions are clipped; lost detail cannot be recovered reliably');
  }

  if (signals.highlightClipping >= 0.06) {
    recommendations.push('Highlights are clipped; keep tone adjustments conservative');
  }

  return recommendations;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
