/**
 * N3uralia Processing Pipeline
 * Real server-side image enhancement powered by sharp (Lanczos resampling,
 * model-aware sharpening, denoise, and format-preserving encode).
 */

import sharp from 'sharp';
import type { EnhancementStrategy } from './engine';

export interface EnhanceOutput {
  buffer: Buffer;
  width: number;
  height: number;
  format: 'jpeg' | 'png' | 'webp';
  contentType: string;
}

// Cap the output so extreme scale factors can't exhaust memory.
const MAX_OUTPUT_PIXELS = 40_000_000; // 40 MP ceiling

/**
 * Model-specific tuning. Each N3uralia model maps to a distinct
 * sharpening/denoise profile applied after upscaling.
 */
function getModelProfile(model: string): {
  sharpenSigma: number;
  denoise: boolean;
  saturation: number;
} {
  switch (model) {
    case 'Face Restoration':
      // Gentle on skin, light denoise, neutral color.
      return { sharpenSigma: 0.6, denoise: true, saturation: 1.0 };
    case 'Nature Enhanced':
      // Punchy detail and slightly richer color for foliage/landscapes.
      return { sharpenSigma: 1.1, denoise: false, saturation: 1.08 };
    case 'Architecture v1':
      // Crisp edges for lines and structure, no color shift.
      return { sharpenSigma: 1.3, denoise: false, saturation: 1.0 };
    case 'Clean Detail':
      // Balanced sharpening with denoise for noisy sources.
      return { sharpenSigma: 0.9, denoise: true, saturation: 1.02 };
    default:
      // Full Spectrum / fallback.
      return { sharpenSigma: 1.0, denoise: false, saturation: 1.03 };
  }
}

/**
 * Apply N3uralia enhancement to an image buffer.
 * Performs real Lanczos upscaling + model-aware post-processing.
 */
export async function enhanceImage(
  imageBuffer: Buffer,
  strategy: EnhancementStrategy
): Promise<EnhanceOutput> {
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error('Invalid image buffer');
  }

  // Respect EXIF orientation, then read true dimensions.
  const pipeline = sharp(imageBuffer, { failOn: 'none' }).rotate();
  const metadata = await pipeline.metadata();

  const srcWidth = metadata.width ?? 0;
  const srcHeight = metadata.height ?? 0;
  if (!srcWidth || !srcHeight) {
    throw new Error('Unable to read image dimensions');
  }

  // Compute target size, clamped to the pixel ceiling.
  let targetWidth = Math.round(srcWidth * strategy.scaleFactor);
  let targetHeight = Math.round(srcHeight * strategy.scaleFactor);
  const targetPixels = targetWidth * targetHeight;
  if (targetPixels > MAX_OUTPUT_PIXELS) {
    const ratio = Math.sqrt(MAX_OUTPUT_PIXELS / targetPixels);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  const profile = getModelProfile(strategy.model);

  // High-quality upscale using Lanczos3 resampling.
  let processed = pipeline.resize(targetWidth, targetHeight, {
    kernel: sharp.kernel.lanczos3,
    fit: 'fill',
  });

  // Optional denoise for noisy / low-quality sources.
  if (profile.denoise) {
    processed = processed.median(3);
  }

  // Detail recovery via unsharp masking. Heavier for "quality" target.
  const sigma =
    strategy.qualityTarget === 'quality'
      ? profile.sharpenSigma * 1.2
      : strategy.qualityTarget === 'speed'
        ? profile.sharpenSigma * 0.7
        : profile.sharpenSigma;
  processed = processed.sharpen({ sigma });

  // Subtle color enrichment where the model calls for it.
  if (profile.saturation !== 1.0) {
    processed = processed.modulate({ saturation: profile.saturation });
  }

  // Encode preserving the source format (PNG keeps alpha; WebP stays WebP).
  const inputFormat = metadata.format;
  let outBuffer: Buffer;
  let outFormat: EnhanceOutput['format'];
  let contentType: string;

  if (inputFormat === 'png') {
    outBuffer = await processed.png({ compressionLevel: 9 }).toBuffer();
    outFormat = 'png';
    contentType = 'image/png';
  } else if (inputFormat === 'webp') {
    outBuffer = await processed
      .webp({ quality: strategy.qualityTarget === 'speed' ? 82 : 92 })
      .toBuffer();
    outFormat = 'webp';
    contentType = 'image/webp';
  } else {
    // JPEG and everything else encode to high-quality JPEG.
    outBuffer = await processed
      .jpeg({ quality: strategy.qualityTarget === 'speed' ? 84 : 94, mozjpeg: true })
      .toBuffer();
    outFormat = 'jpeg';
    contentType = 'image/jpeg';
  }

  return {
    buffer: outBuffer,
    width: targetWidth,
    height: targetHeight,
    format: outFormat,
    contentType,
  };
}

/**
 * Validate enhancement strategy is compatible with the request.
 */
export function validateStrategy(
  _imageBuffer: Buffer,
  strategy: EnhancementStrategy
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (strategy.scaleFactor < 1 || strategy.scaleFactor > 8) {
    errors.push('Scale factor must be between 1x and 8x');
  }

  if (strategy.preservationLevel < 0 || strategy.preservationLevel > 1) {
    errors.push('Preservation level must be between 0 and 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get quality metrics for the enhanced image based on strategy parameters.
 */
export function getQualityMetrics(strategy: EnhancementStrategy): {
  fidelity: number;
  detail: number;
  preservation: number;
} {
  const baseQuality = 0.85;
  const qualityBoost = strategy.qualityTarget === 'quality' ? 0.15 : 0.05;

  return {
    fidelity: Math.min(baseQuality + qualityBoost, 0.99),
    detail: Math.min(baseQuality + qualityBoost - 0.03, 0.96),
    preservation:
      strategy.preservationLevel * (1 - 0.01 * (strategy.scaleFactor - 1)),
  };
}
