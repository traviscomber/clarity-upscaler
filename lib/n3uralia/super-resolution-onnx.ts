import sharp from 'sharp';
import type { Tensor as OrtTensorType } from 'onnxruntime-web';
import type {
  SuperResolutionBackend,
  SuperResolutionRequest,
  SuperResolutionResult,
} from './super-resolution';

let cachedSession: Promise<import('onnxruntime-web').InferenceSession> | null = null;

function getModelLocation(): string | null {
  return process.env.N3URALIA_ONNX_MODEL_URL ?? process.env.N3URALIA_ONNX_MODEL_PATH ?? null;
}

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

async function getSession(): Promise<import('onnxruntime-web').InferenceSession> {
  const location = getModelLocation();
  if (!location) throw new Error('N3URALIA_ONNX_MODEL_URL is not configured');

  if (!cachedSession) {
    cachedSession = (async () => {
      const ort = await import('onnxruntime-web');
      const model = await loadModelBytes(location);
      return ort.InferenceSession.create(model, {
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

async function runOnnx(
  request: SuperResolutionRequest,
): Promise<SuperResolutionResult> {
  const session = await getSession();
  const ort = await import('onnxruntime-web');
  const decoded = await sharp(request.imageBuffer, { failOn: 'none' })
    .rotate()
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
  const requestedWidth = Math.round(decoded.info.width * request.strategy.scaleFactor);
  const requestedHeight = Math.round(decoded.info.height * request.strategy.scaleFactor);

  let image = sharp(rgb.data, {
    raw: { width: rgb.width, height: rgb.height, channels: 3 },
  });

  if (rgb.width !== requestedWidth || rgb.height !== requestedHeight) {
    image = image.resize(requestedWidth, requestedHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill',
    });
  }

  const buffer = await image.png({ compressionLevel: 4 }).toBuffer();

  return {
    buffer,
    width: requestedWidth,
    height: requestedHeight,
    format: 'png',
    contentType: 'image/png',
    tiled: false,
    tileCount: 0,
    requestedScaleFactor: request.strategy.scaleFactor,
    appliedScaleFactor: request.strategy.scaleFactor,
    outputClamped: false,
    backend: 'onnx',
    neural: true,
  };
}

export const onnxSuperResolutionBackend: SuperResolutionBackend = {
  id: 'onnx',
  async isAvailable() {
    return Boolean(getModelLocation());
  },
  upscale: runOnnx,
};
