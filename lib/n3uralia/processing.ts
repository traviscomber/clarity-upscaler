/**
 * N3uralia Processing Pipeline
 * Deterministic Sharp/libvips enhancement with materialized progressive stages.
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

const MAX_OUTPUT_PIXELS = 40_000_000;

function getPhilzProfile(strategy: EnhancementStrategy): {
  sharpenSigma: number;
  denoise: boolean;
  denoiseRadius: number;
  saturation: number;
} {
  const creativity = strategy.creativity ?? 0.35;
  const resemblance = strategy.resemblance ?? 0.6;
  const denoiseSteps = strategy.denoise_steps ?? 18;

  return {
    sharpenSigma: 0.4 + creativity * 1.2,
    denoise: denoiseSteps > 12,
    denoiseRadius: Math.min(5, Math.ceil(denoiseSteps / 6)),
    saturation: 0.95 + resemblance * 0.05,
  };
}

function buildUpscaleSteps(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): Array<[number, number]> {
  const steps: Array<[number, number]> = [];
  let width = sourceWidth;
  let height = sourceHeight;

  while (width * 2 < targetWidth && height * 2 < targetHeight) {
    width = Math.round(width * 2);
    height = Math.round(height * 2);
    steps.push([width, height]);
  }

  steps.push([targetWidth, targetHeight]);
  return steps;
}

async function materializeResizeStages(
  inputBuffer: Buffer,
  steps: Array<[number, number]>,
): Promise<Buffer> {
  let currentBuffer = inputBuffer;

  for (const [width, height] of steps) {
    currentBuffer = await sharp(currentBuffer, { failOn: 'none' })
      .resize(width, height, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill',
      })
      .toBuffer();
  }

  return currentBuffer;
}

export async function enhanceImage(
  imageBuffer: Buffer,
  strategy: EnhancementStrategy,
): Promise<EnhanceOutput> {
  if (!imageBuffer?.length) {
    throw new Error('Invalid image buffer');
  }

  const metadata = await sharp(imageBuffer, { failOn: 'none' })
    .rotate()
    .metadata();
  const sourceWidth = metadata.width ?? 0;
  const sourceHeight = metadata.height ?? 0;

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Unable to read image dimensions');
  }

  let targetWidth = Math.round(sourceWidth * strategy.scaleFactor);
  let targetHeight = Math.round(sourceHeight * strategy.scaleFactor);
  const targetPixels = targetWidth * targetHeight;

  if (targetPixels > MAX_OUTPUT_PIXELS) {
    const ratio = Math.sqrt(MAX_OUTPUT_PIXELS / targetPixels);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  const profile = getPhilzProfile(strategy);

  let preparedBuffer = await sharp(imageBuffer, { failOn: 'none' })
    .rotate()
    .toBuffer();

  if (profile.denoise) {
    preparedBuffer = await sharp(preparedBuffer, { failOn: 'none' })
      .median(profile.denoiseRadius)
      .toBuffer();
  }

  const speed = strategy.qualityTarget === 'speed';
  const steps = speed
    ? [[targetWidth, targetHeight] as [number, number]]
    : buildUpscaleSteps(sourceWidth, sourceHeight, targetWidth, targetHeight);

  const resizedBuffer = await materializeResizeStages(preparedBuffer, steps);
  let finalPipeline = sharp(resizedBuffer, { failOn: 'none' });

  let sigma = profile.sharpenSigma;
  if (strategy.qualityTarget === 'quality') {
    sigma *= 1.2;
  } else if (speed) {
    sigma *= 0.7;
  }

  const sharpen = strategy.sharpen ?? 2;
  if (sharpen > 0) {
    finalPipeline = finalPipeline.sharpen({
      sigma: sigma * (sharpen / 2.5),
      m1: 0.5,
      m2: 2.5,
    });
  }

  if (profile.saturation !== 1) {
    finalPipeline = finalPipeline.modulate({ saturation: profile.saturation });
  }

  const inputFormat = metadata.format;
  let outputBuffer: Buffer;
  let outputFormat: EnhanceOutput['format'];
  let contentType: string;

  if (inputFormat === 'png') {
    outputBuffer = await finalPipeline.png({ compressionLevel: 9 }).toBuffer();
    outputFormat = 'png';
    contentType = 'image/png';
  } else if (inputFormat === 'webp') {
    outputBuffer = await finalPipeline
      .webp({ quality: speed ? 82 : 92 })
      .toBuffer();
    outputFormat = 'webp';
    contentType = 'image/webp';
  } else {
    outputBuffer = await finalPipeline
      .jpeg({ quality: speed ? 84 : 94, mozjpeg: true })
      .toBuffer();
    outputFormat = 'jpeg';
    contentType = 'image/jpeg';
  }

  return {
    buffer: outputBuffer,
    width: targetWidth,
    height: targetHeight,
    format: outputFormat,
    contentType,
  };
}

export function validateStrategy(
  _imageBuffer: Buffer,
  strategy: EnhancementStrategy,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (
    !Number.isFinite(strategy.scaleFactor) ||
    strategy.scaleFactor < 1 ||
    strategy.scaleFactor > 8
  ) {
    errors.push('Scale factor must be between 1x and 8x');
  }

  if (
    !Number.isFinite(strategy.preservationLevel) ||
    strategy.preservationLevel < 0 ||
    strategy.preservationLevel > 1
  ) {
    errors.push('Preservation level must be between 0 and 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
