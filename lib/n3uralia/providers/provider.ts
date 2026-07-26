import type { EnhancementStrategy } from '../engine';
import type { EnhanceOutput } from '../processing';

export type EnhancementProviderName = 'sharp' | 'n3uralia';

export interface ProviderEnhancementResult extends EnhanceOutput {
  provider: EnhancementProviderName;
  executionMode: 'cpu' | 'native-ai';
}

export interface EnhancementProvider {
  readonly name: EnhancementProviderName;
  readonly executionMode: ProviderEnhancementResult['executionMode'];

  isAvailable(): boolean;

  process(
    imageBuffer: Buffer,
    strategy: EnhancementStrategy
  ): Promise<ProviderEnhancementResult>;
}
