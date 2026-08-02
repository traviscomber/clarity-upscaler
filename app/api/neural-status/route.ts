import {
  getConfiguredModel,
  getConfiguredModelLocation,
} from '@/lib/n3uralia/model-manifest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ProbeResult = {
  attempted: boolean;
  reachable: boolean | null;
  status: number | null;
  contentType: string | null;
  contentLength: string | null;
  error: string | null;
};

function getSafeHost(location: string | null): string | null {
  if (!location) return null;

  try {
    return new URL(location).hostname;
  } catch {
    return 'local-path';
  }
}

async function probeModel(location: string): Promise<ProbeResult> {
  if (!/^https?:\/\//i.test(location)) {
    return {
      attempted: false,
      reachable: null,
      status: null,
      contentType: null,
      contentLength: null,
      error: null,
    };
  }

  try {
    const response = await fetch(location, {
      method: 'GET',
      headers: { Range: 'bytes=0-1023' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    await response.body?.cancel();

    return {
      attempted: true,
      reachable: response.ok || response.status === 206,
      status: response.status,
      contentType: response.headers.get('content-type'),
      contentLength:
        response.headers.get('content-range') ??
        response.headers.get('content-length'),
      error: null,
    };
  } catch (error) {
    return {
      attempted: true,
      reachable: false,
      status: null,
      contentType: null,
      contentLength: null,
      error: error instanceof Error ? error.message : 'Model probe failed',
    };
  }
}

export async function GET(request: Request) {
  const model = getConfiguredModel();
  const location = model ? getConfiguredModelLocation(model) : null;
  const backend = process.env.N3URALIA_SR_BACKEND ?? 'classical';
  const shouldProbe = new URL(request.url).searchParams.get('probe') === '1';
  const probe =
    shouldProbe && location
      ? await probeModel(location)
      : {
          attempted: false,
          reachable: null,
          status: null,
          contentType: null,
          contentLength: null,
          error: null,
        };

  const configured = backend === 'onnx' && Boolean(model && location);
  const ready = configured && (!probe.attempted || probe.reachable === true);

  return Response.json(
    {
      ready,
      configured,
      backend,
      model: model
        ? {
            id: model.id,
            name: model.name,
            architecture: model.architecture,
            scale: model.scale,
            tileSize: Number(
              process.env.N3URALIA_ONNX_TILE_SIZE ?? model.tileSize,
            ),
            overlap: Number(
              process.env.N3URALIA_ONNX_TILE_OVERLAP ?? model.overlap,
            ),
          }
        : null,
      modelLocation: {
        configured: Boolean(location),
        host: getSafeHost(location),
      },
      probe,
      fallbackEnabled: true,
    },
    {
      status: ready ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
