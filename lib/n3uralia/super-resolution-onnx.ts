import sharp from 'sharp';
import type { Tensor as OrtTensorType } from 'onnxruntime-web';
import {
  getConfiguredModel,
  getConfiguredModelLocation,
  type SuperResolutionModelManifest,
} from './model-manifest';
import { createTilePlan, type TilePlan } from './tile-engine';
import type {
  SuperResolutionBackend,
  SuperResolutionRequest,
  SuperResolutionResult,
} from './super-resolution';

const MAX_OUTPUT_PIXELS = 40_000_000;
let cachedSession: Promise<import('onnxruntime-web').InferenceSession> | null = null;
let cachedLocation: string | null = null;

async function loadModelBytes(location: string): Promise<Uint8Array> {
  if (/^https?:\/\//i.test(location)) {
    const response = await fetch(location);
    if (!response.ok) {
      throw new Error(`Unable to download ONNX model (${response.status})`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  const { readFile } = await import('node:fs/promises');
  return new Uint8Array(await readFile(location));
}

async function getSession(
  model: SuperResolutionModelManifest,
): Promise<import('onnxruntime-web').InferenceSession> {
  const location = getConfiguredModelLocation(model);
  if (!location) throw new Error(`${model.modelUrlEnv} is not configured`);

  if (!cachedSession || cachedLocation !== location) {
    cachedLocation = location;
    cachedSession = (async () => {
      const ort = await import('onnxruntime-web');
      const bytes = await loadModelBytes(location);
      return ort.InferenceSession.create(bytes, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
    })();
  }

  return cachedSession;
}

function rawRgbToNchw(data: Buffer, width: number, height: number): Float32Array {
  const pixels = width * height;
  const tensor = new Float32Array(pixels * 3);

  for (let i = 0; i < pixels; i += 1) {
    tensor[i] = data[i * 3] / 255;
    tensor[pixels + i] = data[i * 3 + 1] / 255;
    tensor[pixels * 2 + i] = data[i * 3 + 2] / 255;
  }

  return tensor;
}

function tensorToRgb(
  tensor: OrtTensorType,
): { data: Buffer; width: number; height: number } {
  const dims = tensor.dims.map(Number);
  if (dims.length !== 4 || dims[0] !== 1) {
    throw new Error(`Unsupported ONNX output dimensions: ${dims.join('x')}`);
  }

  const values = tensor.data as Float32Array;
  const nchw = dims[1] === 3;
  if (!nchw && dims[3] !== 3) {
    throw new Error(`ONNX output must contain three RGB channels: ${dims.join('x')}`);
  }

  const height = nchw ? dims[2] : dims[1];
  const width = nchw ? dims[3] : dims[2];
  const pixels = width * height;
  const output = Buffer.allocUnsafe(pixels * 3);

  for (let i = 0; i < pixels; i += 1) {
    for (let channel = 0; channel < 3; channel += 1) {
      const value = nchw
        ? values[channel * pixels + i]
        : values[i * 3 + channel];
      output[i * 3 + channel] = Math.max(
        0,
        Math.min(255, Math.round(Number(value) * 255)),
      );
    }
  }

  return { data: output, width, height };
}

async function inferTile(
  session: import('onnxruntime-web').InferenceSession,
  sourceBuffer: Buffer,
  tile: TilePlan['tiles'][number],
): Promise<{ input: Buffer; left: number; top: number; scaleX: number; scaleY: number }> {
  const ort = await import('onnxruntime-web');
  const decoded = await sharp(sourceBuffer, { failOn: 'none' })
    .extract({
      left: tile.left,
      top: tile.top,
      width: tile.width,
      height: tile.height,
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const inputName = process.env.N3URALIA_ONNX_INPUT_NAME ?? session.inputNames[0];
  const outputName = process.env.N3URALIA_ONNX_OUTPUT_NAME ?? session.outputNames[0];
  if (!inputName || !outputName) throw new Error('ONNX model has no usable input/output');

  const input = new ort.Tensor(
    'float32',
    rawRgbToNchw(decoded.data, decoded.info.width, decoded.info.height),
    [1, 3, decoded.info.height, decoded.info.width],
  );
  const results = await session.run({ [inputName]: input });
  const output = results[outputName];
  if (!output) throw new Error(`ONNX model did not return output '${outputName}'`);

  const rgb = tensorToRgb(output);
  const scaleX = rgb.width / tile.width;
  const scaleY = rgb.height / tile.height;
  const cropLeft = Math.round(tile.cropLeft * scaleX);
  const cropTop = Math.round(tile.cropTop * scaleY);
  const coreWidth = Math.max(1, Math.round(tile.coreWidth * scaleX));
  const coreHeight = Math.max(1, Math.round(tile.coreHeight * scaleY));
  const inputBuffer = await sharp(rgb.data, {
    raw: { width: rgb.width, height: rgb.height, channels: 3 },
  })
    .extract({
      left: cropLeft,
      top: cropTop,
      width: Math.min(coreWidth, rgb.width - cropLeft),
      height: Math.min(coreHeight, rgb.height - cropTop),
    })
    .png()
    .toBuffer();

  return {
    input: inputBuffer,
    left: Math.round(tile.coreLeft * scaleX),
    top: Math.round(tile.coreTop * scaleY),
    scaleX,
    scaleY,
  };
}

async function runOnnx(
  request: SuperResolutionRequest,
): Promise<SuperResolutionResult> {
  const model = getConfiguredModel();
  if (!model) throw new Error('No ONNX super-resolution model is configured');

  const session = await getSession(model);
  const normalized = await sharp(request.imageBuffer, { failOn: 'none' })
    .rotate()
    .removeAlpha()
    .png()
    .toBuffer();
  const metadata = await sharp(normalized).metadata();
  const sourceWidth = metadata.width ?? 0;
  const sourceHeight = metadata.height ?? 0;
  if (!sourceWidth || !sourceHeight) throw new Error('Unable to decode neural input');

  const plan = createTilePlan(sourceWidth, sourceHeight, {
    tileSize: Number(process.env.N3URALIA_ONNX_TILE_SIZE ?? model.tileSize),
    overlap: Number(process.env.N3URALIA_ONNX_TILE_OVERLAP ?? model.overlap),
  });

  const composites = [] as Array<{ input: Buffer; left: number; top: number }>;
  let inferredScaleX = model.scale;
  let inferredScaleY = model.scale;

  for (const tile of plan.tiles) {
    const inferred = await inferTile(session, normalized, tile);
    inferredScaleX = inferred.scaleX;
    inferredScaleY = inferred.scaleY;
    composites.push({ input: inferred.input, left: inferred.left, top: inferred.top });
  }

  const neuralWidth = Math.round(sourceWidth * inferredScaleX);
  const neuralHeight = Math.round(sourceHeight * inferredScaleY);
  let neuralBuffer = await sharp({
    create: {
      width: neuralWidth,
      height: neuralHeight,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 4 })
    .toBuffer();

  const requestedWidth = Math.round(sourceWidth * request.strategy.scaleFactor);
  const requestedHeight = Math.round(sourceHeight * request.strategy.scaleFactor);
  const requestedPixels = requestedWidth * requestedHeight;
  const outputClamped = requestedPixels > MAX_OUTPUT_PIXELS;
  let targetWidth = requestedWidth;
  let targetHeight = requestedHeight;

  if (outputClamped) {
    const ratio = Math.sqrt(MAX_OUTPUT_PIXELS / requestedPixels);
    targetWidth = Math.max(1, Math.round(requestedWidth * ratio));
    targetHeight = Math.max(1, Math.round(requestedHeight * ratio));
  }

  if (neuralWidth !== targetWidth || neuralHeight !== targetHeight) {
    neuralBuffer = await sharp(neuralBuffer)
      .resize(targetWidth, targetHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill',
      })
      .png({ compressionLevel: 4 })
      .toBuffer();
  }

  return {
    buffer: neuralBuffer,
    width: targetWidth,
    height: targetHeight,
    format: 'png',
    contentType: 'image/png',
    tiled: plan.tiles.length > 1,
    tileCount: plan.tiles.length,
    requestedScaleFactor: request.strategy.scaleFactor,
    appliedScaleFactor: Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight),
    outputClamped,
    tilePlan: {
      tileSize: plan.tileSize,
      overlap: plan.overlap,
      rows: plan.rows,
      columns: plan.columns,
    },
    backend: 'onnx',
    neural: true,
    modelId: model.id,
  };
}

export const onnxSuperResolutionBackend: SuperResolutionBackend = {
  id: 'onnx',
  async isAvailable() {
    const model = getConfiguredModel();
    return Boolean(model && getConfiguredModelLocation(model));
  },
  upscale: runOnnx,
};
