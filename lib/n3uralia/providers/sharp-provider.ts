import type { EnhancementStrategy } from '../engine';
import { enhanceImage } from '../processing';
import type {
  EnhancementProvider,
  ProviderEnhancementResult,
} from './provider';

export class SharpProvider implements EnhancementProvider {
  readonly name = 'sharp' as const;
  readonly executionMode = 'cpu' as const;

  isAvailable(): boolean {
    return true;
  }

  async process(
    imageBuffer: Buffer,
    strategy: EnhancementStrategy
  ): Promise<ProviderEnhancementResult> {
    const result = await enhanceImage(imageBuffer, strategy);

    return {
      ...result,
      provider: this.name,
      executionMode: this.executionMode,
    };
  }
}
