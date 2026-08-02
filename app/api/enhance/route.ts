import sharp from 'sharp';
import {
  processImage,
  type EnhancementStrategy,
} from '@/lib/n3uralia/engine';
import { validateStrategy } from '@/lib/n3uralia/processing';

function encodeHeaderJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const strategyJson = formData.get('strategy');

    if (!(file instanceof File) || typeof strategyJson !== 'string') {
      return Response.json(
        { error: 'Missing image or strategy' },
        { status: 400 },
      );
    }

    let strategy: EnhancementStrategy;
    try {
      strategy = JSON.parse(strategyJson) as EnhancementStrategy;
    } catch {
      return Response.json(
        { error: 'Invalid strategy JSON' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length > 50 * 1024 * 1024) {
      return Response.json(
        { error: 'Image too large (max 50MB)' },
        { status: 413 },
      );
    }

    const validation = validateStrategy(buffer, strategy);
    if (!validation.valid) {
      return Response.json(
        { error: 'Invalid strategy', details: validation.errors },
        { status: 400 },
      );
    }

    const result = await processImage(buffer, { strategy });
    const { enhancement, metrics, benchmark, pipeline } = result;

    const shouldExportLossless = strategy.qualityTarget !== 'speed';
    const responseBuffer = shouldExportLossless
      ? await sharp(enhancement.buffer, { failOn: 'none' })
          .png({ compressionLevel: 4, adaptiveFiltering: true })
          .toBuffer()
      : enhancement.buffer;
    const responseContentType = shouldExportLossless
      ? 'image/png'
      : enhancement.contentType;

    const benchmarkSummary = {
      id: benchmark.id,
      engineVersion: benchmark.engineVersion,
      model: benchmark.model,
      presetId: benchmark.presetId,
      scaleFactor: benchmark.scaleFactor,
      qualityTarget: benchmark.qualityTarget,
      inputChecksum: benchmark.input.checksum,
      outputChecksum: benchmark.output.checksum,
      metricMethod: metrics.method,
    };

    const exposedHeaders = [
      'X-Engine-Version',
      'X-Processing-Time',
      'X-Enhancement-Time',
      'X-Evaluation-Time',
      'X-Original-Size',
      'X-Enhanced-Size',
      'X-Output-Width',
      'X-Output-Height',
      'X-Scale-Factor',
      'X-Model',
      'X-Metrics-Method',
      'X-Fidelity',
      'X-Detail',
      'X-Preservation',
      'X-Detail-Gain',
      'X-Tone-Preservation',
      'X-Tiled-Processing',
      'X-Tile-Plan',
      'X-Benchmark-Id',
      'X-Benchmark-Summary',
      'X-Input-Checksum',
      'X-Output-Checksum',
      'X-Pipeline-Steps',
      'X-Export-Format',
    ];

    const responseHeaders = {
      'Content-Type': responseContentType,
      'Content-Length': String(responseBuffer.length),
      'Content-Disposition': 'attachment; filename="clar1ty-upscaled.png"',
      'X-Engine-Version': result.engineVersion,
      'X-Processing-Time': String(result.processingTime),
      'X-Enhancement-Time': String(result.enhancementTime),
      'X-Evaluation-Time': String(result.evaluationTime),
      'X-Original-Size': String(result.originalSize),
      'X-Enhanced-Size': String(responseBuffer.length),
      'X-Output-Width': String(enhancement.width),
      'X-Output-Height': String(enhancement.height),
      'X-Scale-Factor': String(strategy.scaleFactor),
      'X-Model': strategy.model,
      'X-Metrics-Method': metrics.method,
      'X-Fidelity': String(Math.round(metrics.fidelity * 10000) / 100),
      'X-Detail': String(Math.round(metrics.detail * 10000) / 100),
      'X-Preservation': String(Math.round(metrics.preservation * 10000) / 100),
      'X-Detail-Gain': String(Math.round(metrics.detailGain * 10000) / 100),
      'X-Tone-Preservation': String(
        Math.round(metrics.tonePreservation * 10000) / 100,
      ),
      'X-Tiled-Processing': String(enhancement.tiled),
      'X-Tile-Plan': enhancement.tilePlan
        ? encodeHeaderJson(enhancement.tilePlan)
        : '',
      'X-Benchmark-Id': benchmark.id,
      'X-Benchmark-Summary': encodeHeaderJson(benchmarkSummary),
      'X-Input-Checksum': benchmark.input.checksum,
      'X-Output-Checksum': benchmark.output.checksum,
      'X-Pipeline-Steps': encodeHeaderJson(
        pipeline.steps.map(({ id, stage, status, durationMs }) => ({
          id,
          stage,
          status,
          durationMs,
        })),
      ),
      'X-Export-Format': shouldExportLossless ? 'png-lossless' : enhancement.format,
      'Access-Control-Expose-Headers': exposedHeaders.join(', '),
    };

    return new Response(new Uint8Array(responseBuffer), {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Enhancement error:', error);
    return Response.json(
      {
        error: 'Failed to enhance image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
