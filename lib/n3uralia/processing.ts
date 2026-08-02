/**
 * N3uralia Processing Pipeline
 * Deterministic Sharp/libvips enhancement with materialized progressive stages
 * and overlap-aware tiled execution for large images.
 */

import sharp from 'sharp';
import type { EnhancementStrategy } from './engine';
import {
  createTilePlan,
  recommendTileOptions,
  shouldUseTiles,
  type TilePlan,
} from './tile-engine';

export interface EnhanceOutput {
  buffer: Buffer;
  width: number;
  height: number;
  format: 'jpeg' | 'png' | 'webp';
  contentType: string;
  tiled: boolean;
  tileCount: number;
  requestedScaleFactor: number;
  appliedScaleFactor: number;
  outputClamped: boolean;
  tilePlan?: Pick<TilePlan, 'tileSize' | 'overlap' | 'rows' | 'columns'>;
}

const MAX_OUTPUT_PIXELS = 40_000_000;
const TILE_SOURCE_PIXEL_THRESHOLD = 16_000_000;

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

async function resizeTile(
  sourceBuffer: Buffer,
  tile: TilePlan['tiles'][number],
  scaleX: number,
  scaleY: number,
  speed: boolean,
  denoiseRadius?: number,
): Promise<{ input: Buffer; left: number; top: number }> {
  let tilePipeline = sharp(sourceBuffer, { failOn: 'none' }).extract({
    left: tile.left,
    top: tile.top,
    width: tile.width,
    height: tile.height,
  });

  if (denoiseRadius) {
    tilePipeline = tilePipeline.median(denoiseRadius);
  }

  const extracted = await tilePipeline.toBuffer();
  const scaledTileWidth = Math.max(1, Math.round(tile.width * scaleX));
  const scaledTileHeight = Math.max(1, Math.round(tile.height * scaleY));
  const steps = speed
    ? [[scaledTileWidth, scaledTileHeight] as [number, number]]
    : buildUpscaleSteps(
        tile.width,
        tile.height,
        scaledTileWidth,
        scaledTileHeight,
      );
  const resized = await materializeResizeStages(extracted, steps);

  const cropLeft = Math.round(tile.cropLeft * scaleX);
  const cropTop = Math.round(tile.cropTop * scaleY);
  const coreWidth = Math.max(1, Math.round(tile.coreWidth * scaleX));
  const coreHeight = Math.max(1, Math.round(tile.coreHeight * scaleY));
  const cropped = await sharp(resized, { failOn: 'none' })
    .extract({
      left: cropLeft,
      top: cropTop,
      width: Math.min(coreWidth, scaledTileWidth - cropLeft),
      height: Math.min(coreHeight, scaledTileHeight - cropTop),
    })
    .png()
    .toBuffer();

  return {
    input: cropped,
    left: Math.round(tile.coreLeft * scaleX),
    top: Math.round(tile.coreTop * scaleY),
  };
}

async function tiledResize(
  sourceBuffer: Buffer,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  strategy: EnhancementStrategy,
  denoiseRadius?: number,
): Promise<{ buffer: Buffer; plan: TilePlan }> {
  const memoryMb = Number(process.env.N3URALIA_TILE_MEMORY_MB ?? 768);
  const recommended = recommendTileOptions(
    sourceWidth,
    sourceHeight,
    Number.isFinite(memoryMb) ? memoryMb : 768,
  );
  const requestedOverlap = strategy.tile_overlap;
  const overlap = Number.isFinite(requestedOverlap)
    ? Math.max(0, Math.round(requestedOverlap!))
    : recommended.overlap;
  const plan = createTilePlan(sourceWidth, sourceHeight, {
    tileSize: recommended.tileSize,
    overlap: Math.min(overlap, Math.floor((recommended.tileSize - 1) / 2)),
  });
  const scaleX = targetWidth / sourceWidth;
  const scaleY = targetHeight / sourceHeight;
  const composites: Array<{ input: Buffer; left: number; top: number }> = [];

  for (const tile of plan.tiles) {
    composites.push(
      await resizeTile(
        sourceBuffer,
        tile,
        scaleX,
        scaleY,
        strategy.qualityTarget === 'speed',
        denoiseRadius,
      ),
    );
  }

  const buffer = await sharp({
    create: {
      width: targetWidth,
      height: targetHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  return { buffer, plan };
}

export async function enhanceImage(
  imageBuffer: Buffer,
  strategy: EnhancementStrategy,
): Promise<EnhanceOutput> {
  if (!imageBuffer?.length) {
    throw new Error('Invalid image buffer');
  }

  const normalizedBuffer = await sharp(imageBuffer, { failOn: 'none' })
    .rotate()
    .toBuffer();
  const metadata = await sharp(normalizedBuffer, { failOn: 'none' }).metadata();
  const sourceWidth = metadata.width ?? 0;
  const sourceHeight = metadata.height ?? 0;

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Unable to read image dimensions');
  }

  const requestedTargetWidth = Math.round(sourceWidth * strategy.scaleFactor);
  const requestedTargetHeight = Math.round(sourceHeight * strategy.scaleFactor);
  let targetWidth = requestedTargetWidth;
  let targetHeight = requestedTargetHeight;
  const requestedTargetPixels = targetWidth * targetHeight;
  const outputClamped = requestedTargetPixels > MAX_OUTPUT_PIXELS;

  if (outputClamped) {
    const ratio = Math.sqrt(MAX_OUTPUT_PIXELS / requestedTargetPixels);
    targetWidth = Math.max(1, Math.round(targetWidth * ratio));
    targetHeight = Math.max(1, Math.round(targetHeight * ratio));
  }

  const profile = getPhilzProfile(strategy);
  const useTiles =
    shouldUseTiles(
      sourceWidth,
      sourceHeight,
      TILE_SOURCE_PIXEL_THRESHOLD,
    ) || requestedTargetPixels > MAX_OUTPUT_PIXELS;
  const speed = strategy.qualityTarget === 'speed';

  let resizedBuffer: Buffer;
  let tilePlan: TilePlan | undefined;

  if (useTiles) {
    const tiled = await tiledResize(
      normalizedBuffer,
      sourceWidth,
      sourceHeight,
      targetWidth,
      targetHeight,
      strategy,
      profile.denoise ? profile.denoiseRadius : undefined,
    );
    resizedBuffer = tiled.buffer;
    tilePlan = tiled.plan;
  } else {
    let preparedBuffer = normalizedBuffer;
    if (profile.denoise) {
      preparedBuffer = await sharp(preparedBuffer, { failOn: 'none' })
        .median(profile.denoiseRadius)
        .toBuffer();
    }

    const steps = speed
      ? [[targetWidth, targetHeight] as [number, number]]
      : buildUpscaleSteps(sourceWidth, sourceHeight, targetWidth, targetHeight);
    resizedBuffer = await materializeResizeStages(preparedBuffer, steps);
  }

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
      .flatten({ background: '#ffffff' })
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
    tiled: useTiles,
    tileCount: tilePlan?.tiles.length ?? 0,
    requestedScaleFactor: strategy.scaleFactor,
    appliedScaleFactor: Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight),
    outputClamped,
    tilePlan: tilePlan
      ? {
          tileSize: tilePlan.tileSize,
          overlap: tilePlan.overlap,
          rows: tilePlan.rows,
          columns: tilePlan.columns,
        }
      : undefined,
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

  if (
    strategy.tile_overlap !== undefined &&
    (!Number.isFinite(strategy.tile_overlap) || strategy.tile_overlap < 0)
  ) {
    errors.push('Tile overlap must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
