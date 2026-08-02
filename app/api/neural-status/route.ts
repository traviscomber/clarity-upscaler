import { NextRequest, NextResponse } from 'next/server';
import {
  getConfiguredModel,
  getConfiguredModelLocation,
} from '@/lib/n3uralia/model-manifest';
import {
  parseHuggingFaceModel,
  constructHuggingFaceUrl,
  verifyHuggingFaceModel,
  formatBytes,
} from '@/lib/n3uralia/huggingface-loader';

export const runtime = 'nodejs';

interface NeuralStatusResponse {
  ready: boolean;
  configured: boolean;
  backend?: string;
  model?: {
    id: string;
    name: string;
    scale: number;
  };
  modelLocation?: {
    configured: boolean;
    host?: string;
    url?: string;
  };
  probe?: {
    attempted: boolean;
    reachable?: boolean;
    status?: number;
    contentLength?: string;
    contentType?: string;
  };
  fallback?: {
    enabled: boolean;
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const probe = request.nextUrl.searchParams.has('probe');
    const token = process.env.HUGGINGFACE_TOKEN;
    const response: NeuralStatusResponse = {
      ready: false,
      configured: false,
    };

    // Check backend configuration
    const backend = process.env.N3URALIA_SR_BACKEND;
    if (backend === 'onnx') {
      response.backend = 'onnx';
      response.configured = true;
    }

    // Check model configuration
    const model = getConfiguredModel();
    if (!model) {
      response.error = 'No model configured';
      return NextResponse.json(response, { status: 400 });
    }

    response.model = {
      id: model.id,
      name: model.name,
      scale: model.scale,
    };

    // Check model location
    const location = getConfiguredModelLocation(model);
    if (!location) {
      response.error = `Model URL environment variable not set: ${model.modelUrlEnv}`;
      response.modelLocation = { configured: false };
      return NextResponse.json(response, { status: 400 });
    }

    response.modelLocation = { configured: true };

    // Extract host from URL
    try {
      const url = new URL(location);
      response.modelLocation.host = url.hostname;
      
      // Don't expose full URL for security
      if (probe) {
        response.modelLocation.url = `${url.protocol}//${url.hostname}/[model-path]`;
      }
    } catch {
      // Not a valid URL
      response.modelLocation.host = 'local-path';
    }

    // Probe model availability if requested
    if (probe) {
      response.probe = { attempted: true };
      
      try {
        // Use HF token if available (for private models)
        const verification = await verifyHuggingFaceModel(location, token);
        response.probe.reachable = verification.accessible;
        
        if (verification.status) {
          response.probe.status = verification.status;
        }
        
        if (verification.contentLength) {
          response.probe.contentLength = formatBytes(verification.contentLength);
        }
        
        if (verification.contentType) {
          response.probe.contentType = verification.contentType;
        }
      } catch (error) {
        response.probe.reachable = false;
        response.error = `Probe failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    // Check fallback availability
    response.fallback = {
      enabled: process.env.N3URALIA_SR_BACKEND_FALLBACK !== 'false',
    };

    // Determine readiness
    response.ready =
      response.configured &&
      !!response.model &&
      (response.modelLocation?.configured ?? false) &&
      (!probe || (response.probe?.reachable ?? false));

    const statusCode = response.ready ? 200 : probe ? 503 : 200;
    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ready: false,
        configured: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
