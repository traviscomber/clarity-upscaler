import type { EnhancementStrategy } from '../engine';
import type {
  EnhancementProvider,
  ProviderEnhancementResult,
} from './provider';

function getOutputFormat(contentType: string): ProviderEnhancementResult['format'] {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  return 'jpeg';
}

export class N3uraliaProvider implements EnhancementProvider {
  readonly name = 'n3uralia' as const;
  readonly executionMode = 'native-ai' as const;

  private readonly endpoint = process.env.N3URALIA_ENGINE_URL?.trim();

  isAvailable(): boolean {
    return Boolean(
      this.endpoint && process.env.N3URALIA_ENGINE_ENABLED === 'true'
    );
  }

  async process(
    imageBuffer: Buffer,
    strategy: EnhancementStrategy
  ): Promise<ProviderEnhancementResult> {
    if (!this.isAvailable() || !this.endpoint) {
      throw new Error('N3uralia engine is not configured');
    }

    const formData = new FormData();
    formData.set(
      'image',
      new Blob([new Uint8Array(imageBuffer)], { type: 'application/octet-stream' }),
      'source-image'
    );
    formData.set('strategy', JSON.stringify(strategy));

    const response = await fetch(this.endpoint, {
      method: 'POST',
      body: formData,
      headers: process.env.N3URALIA_ENGINE_TOKEN
        ? { Authorization: `Bearer ${process.env.N3URALIA_ENGINE_TOKEN}` }
        : undefined,
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(
        `N3uralia engine failed (${response.status})${details ? `: ${details}` : ''}`
      );
    }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());
    const width = Number(response.headers.get('x-output-width'));
    const height = Number(response.headers.get('x-output-height'));

    if (!buffer.length || !Number.isFinite(width) || !Number.isFinite(height)) {
      throw new Error('N3uralia engine returned an invalid image response');
    }

    return {
      buffer,
      width,
      height,
      format: getOutputFormat(contentType),
      contentType,
      provider: this.name,
      executionMode: this.executionMode,
    };
  }
}
