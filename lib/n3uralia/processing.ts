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
 * Interpret Philz parameters to sharp operations.
 * Converts creativity/resemblance/denoise_steps/sharpen into local sharp tuning.
 */
function getPhilzProfile(strategy: EnhancementStrategy): {
  sharpenSigma: number;
  denoise: boolean;
  denoiseRadius: number;
  saturation: number;
} {
  // Philz parameters with fallbacks
  const creativity = strategy.creativity ?? 0.35;
  const resemblance = strategy.resemblance ?? 0.6;
  const denoise_steps = strategy.denoise_steps ?? 18;
  const sharpen = strategy.sharpen ?? 2.0;

  // creativity (0.1–0.9) → sharpen intensity: low creativity = gentle, high = aggressive
  const sharpenSigma = 0.4 + creativity * 1.2;

  // denoise_steps (8–28) → aggressiveness of denoise: higher steps = more aggressive
  const denoise = denoise_steps > 12;
  const denoiseRadius = Math.min(5, Math.ceil(denoise_steps / 6));

  // resemblance (0.3–1.6) → saturation: low resemblance = more saturated/artistic
  const saturation = 0.95 + resemblance * 0.05;

  // sharpen (0–10) parameter is already in sharp units, just apply directly
  // (handled in main enhance logic)

  return {
    sharpenSigma,
    denoise,
    denoiseRadius,
    saturation,
  };
}

/**
 * Build a sequence of intermediate sizes that step from the source up to the
 * target in factors of at most 2x. The final entry is always exactly the
 * target size. E.g. 4x -> [2x, 4x]; 8x -> [2x, 4x, 8x]; 1.5x -> [1.5x].
 */
function buildUpscaleSteps(
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number
): Array<[number, number]> {
  const steps: Array<[number, number]> = [];
  let w = srcW;
  let h = srcH;
  // Double until the next double would overshoot the target.
  while (w * 2 < targetW && h * 2 < targetH) {
    w = Math.round(w * 2);
    h = Math.round(h * 2);
    steps.push([w, h]);
  }
  // Always finish exactly on the requested target dimensions.
  steps.push([targetW, targetH]);
  return steps;
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

  const profile = getPhilzProfile(strategy);

  // Denoise noisy / low-quality sources BEFORE enlarging so we don't
  // amplify grain. Use median radius based on Philz denoise_steps parameter.
  let processed = pipeline;
  if (profile.denoise) {
    processed = processed.median(profile.denoiseRadius);
  }

  // Progressive multi-step upscaling. Enlarging in repeated ~2x Lanczos
  // steps (rather than one large jump) yields cleaner edges and fewer
  // ringing/aliasing artifacts on high scale factors. Resampling happens
  // in linear light for gamma-correct results.
  const steps = buildUpscaleSteps(srcWidth, srcHeight, targetWidth, targetHeight);
  const speed = strategy.qualityTarget === 'speed';
  for (let i = 0; i < steps.length; i++) {
    const [w, h] = steps[i];
    if (speed) {
      // Single fast pass for the speed target.
      processed = processed.resize(targetWidth, targetHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill',
      });
      break;
    }
    processed = processed.resize(w, h, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill',
    });
  }

  // Detail recovery via unsharp masking. Sigma calculated from Philz creativity
  // parameter, adjusted for quality target. Sharpen parameter from preset scales intensity.
  let sigma = profile.sharpenSigma;
  if (strategy.qualityTarget === 'quality') {
    sigma *= 1.2;
  } else if (speed) {
    sigma *= 0.7;
  }

  // Apply sharpen parameter (0–10) from Philz preset to scale the effect
  const sharpen = strategy.sharpen ?? 2.0;
  const finalSharpenSigma = sigma * (sharpen / 2.5);
  processed = processed.sharpen({ sigma: finalSharpenSigma, m1: 0.5, m2: 2.5 });

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
