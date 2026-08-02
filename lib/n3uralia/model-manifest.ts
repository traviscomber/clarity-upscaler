export interface SuperResolutionModelManifest {
  id: string;
  name: string;
  architecture: string;
  scale: number;
  inputLayout: 'nchw';
  outputLayout: 'nchw' | 'nhwc' | 'auto';
  tileSize: number;
  overlap: number;
  license: string;
  sourceUrl: string;
  modelUrlEnv: string;
  description: string;
}

export const SUPER_RESOLUTION_MODELS: SuperResolutionModelManifest[] = [
  {
    id: 'realesrgan-x4plus-onnx',
    name: 'Real-ESRGAN x4plus (ONNX)',
    architecture: 'RRDBNet / Real-ESRGAN',
    scale: 4,
    inputLayout: 'nchw',
    outputLayout: 'auto',
    tileSize: 128,
    overlap: 16,
    license: 'BSD-3-Clause',
    sourceUrl: 'https://github.com/xinntao/Real-ESRGAN',
    modelUrlEnv: 'N3URALIA_ONNX_MODEL_URL',
    description:
      'General-purpose 4x neural super-resolution target. Configure an ONNX conversion compatible with RGB float32 NCHW input in the environment variable.',
  },
];

export function getConfiguredModel(): SuperResolutionModelManifest | null {
  const requestedId =
    process.env.N3URALIA_ONNX_MODEL_ID ?? SUPER_RESOLUTION_MODELS[0]?.id;
  const model = SUPER_RESOLUTION_MODELS.find(({ id }) => id === requestedId);
  return model ?? null;
}

export function getConfiguredModelLocation(
  model: SuperResolutionModelManifest,
): string | null {
  return (
    process.env[model.modelUrlEnv] ??
    process.env.N3URALIA_ONNX_MODEL_PATH ??
    null
  );
}
