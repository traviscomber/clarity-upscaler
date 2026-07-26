import type { EnhancementStrategy } from '@/lib/n3uralia/engine';
import { getQualityMetrics, validateStrategy } from '@/lib/n3uralia/processing';
import { enhanceWithProvider } from '@/lib/n3uralia/router';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const strategyJson = formData.get('strategy') as string;

    if (!file || !strategyJson) {
      return Response.json(
        { error: 'Missing image or strategy' },
        { status: 400 }
      );
    }

    let strategy: EnhancementStrategy;
    try {
      strategy = JSON.parse(strategyJson);
    } catch {
      return Response.json(
        { error: 'Invalid strategy JSON' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length > 50 * 1024 * 1024) {
      return Response.json(
        { error: 'Image too large (max 50MB)' },
        { status: 413 }
      );
    }

    const validation = validateStrategy(buffer, strategy);
    if (!validation.valid) {
      return Response.json(
        { error: 'Invalid strategy', details: validation.errors },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const enhanced = await enhanceWithProvider(buffer, strategy);
    const processingTime = Date.now() - startTime;
    const metrics = getQualityMetrics(strategy);

    const responseHeaders = {
      'Content-Type': enhanced.contentType,
      'Content-Length': String(enhanced.buffer.length),
      'X-Processing-Time': String(processingTime),
      'X-Original-Size': String(buffer.length),
      'X-Enhanced-Size': String(enhanced.buffer.length),
      'X-Output-Width': String(enhanced.width),
      'X-Output-Height': String(enhanced.height),
      'X-Scale-Factor': String(strategy.scaleFactor),
      'X-Model': strategy.model,
      'X-Fidelity': String(Math.round(metrics.fidelity * 100)),
      'X-Detail': String(Math.round(metrics.detail * 100)),
      'X-Preservation': String(Math.round(metrics.preservation * 100)),
      'X-Provider': enhanced.provider,
      'X-Execution-Mode': enhanced.executionMode,
      'X-Provider-Requested': enhanced.selection.requested,
      'X-Provider-Fallback': String(enhanced.selection.fallback),
      'X-Provider-Reason': enhanced.selection.reason,
    };

    return new Response(new Uint8Array(enhanced.buffer), {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Enhancement error:', error);
    return Response.json(
      {
        error: 'Failed to enhance image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
