import type { EnhancementStrategy } from './engine';
import { enhanceImage, type EnhanceOutput } from './processing';

export type SuperResolutionBackendId = 'classical' | 'onnx';

export interface SuperResolutionRequest {
  imageBuffer: Buffer;
  strategy: EnhancementStrategy;
}

export interface SuperResolutionResult extends EnhanceOutput {
  backend: SuperResolutionBackendId;
  neural: boolean;
  modelId?: string;
  fallbackReason?: string;
}

export interface SuperResolutionBackend {
  id: SuperResolutionBackendId;
  isAvailable(): Promise<boolean>;
  upscale(request: SuperResolutionRequest): Promise<SuperResolutionResult>;
}

const classicalBackend: SuperResolutionBackend = {
  id: 'classical',
  async isAvailable() {
    return true;
  },
  async upscale({ imageBuffer, strategy }) {
    const result = await enhanceImage(imageBuffer, strategy);
    return {
      ...result,
      backend: 'classical',
      neural: false,
      modelId: 'n3uralia-classical-v1',
    };
  },
};

async function loadOnnxBackend(): Promise<SuperResolutionBackend | null> {
  try {
    const module = await import('./super-resolution-onnx');
    return module.onnxSuperResolutionBackend;
  } catch {
    return null;
  }
}

export async function runSuperResolution(
  request: SuperResolutionRequest,
): Promise<SuperResolutionResult> {
  const requestedBackend =
    request.strategy.superResolutionBackend ??
    (process.env.N3URALIA_SR_BACKEND === 'onnx' ? 'onnx' : 'classical');

  if (requestedBackend === 'onnx') {
    const onnxBackend = await loadOnnxBackend();

    if (onnxBackend && (await onnxBackend.isAvailable())) {
      try {
        return await onnxBackend.upscale(request);
      } catch (error) {
        const fallback = await classicalBackend.upscale(request);
        return {
          ...fallback,
          fallbackReason:
            error instanceof Error ? error.message : 'ONNX inference failed',
        };
      }
    }

    const fallback = await classicalBackend.upscale(request);
    return {
      ...fallback,
      fallbackReason: 'ONNX backend or model is not configured',
    };
  }

  return classicalBackend.upscale(request);
}
