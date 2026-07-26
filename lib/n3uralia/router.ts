import type { EnhancementStrategy } from './engine';
import { N3uraliaProvider } from './providers/n3uralia-provider';
import type {
  EnhancementProvider,
  EnhancementProviderName,
  ProviderEnhancementResult,
} from './providers/provider';
import { SharpProvider } from './providers/sharp-provider';

export interface ProviderSelection {
  requested: EnhancementProviderName;
  selected: EnhancementProviderName;
  fallback: boolean;
  reason: string;
  provider: EnhancementProvider;
}

function getRequestedProvider(
  strategy: EnhancementStrategy
): EnhancementProviderName {
  if (strategy.qualityTarget === 'quality') return 'n3uralia';
  return 'sharp';
}

export function selectEnhancementProvider(
  strategy: EnhancementStrategy
): ProviderSelection {
  const requested = getRequestedProvider(strategy);

  if (requested === 'n3uralia') {
    const n3uralia = new N3uraliaProvider();

    if (n3uralia.isAvailable()) {
      return {
        requested,
        selected: n3uralia.name,
        fallback: false,
        reason: 'Quality workflow routed to the native N3uralia engine',
        provider: n3uralia,
      };
    }

    const sharp = new SharpProvider();
    return {
      requested,
      selected: sharp.name,
      fallback: true,
      reason: 'Native N3uralia engine unavailable; using the Sharp CPU engine',
      provider: sharp,
    };
  }

  const sharp = new SharpProvider();
  return {
    requested,
    selected: sharp.name,
    fallback: false,
    reason: 'Speed and balanced workflows use the Sharp CPU engine',
    provider: sharp,
  };
}

export async function enhanceWithProvider(
  imageBuffer: Buffer,
  strategy: EnhancementStrategy
): Promise<ProviderEnhancementResult & { selection: Omit<ProviderSelection, 'provider'> }> {
  const selection = selectEnhancementProvider(strategy);

  try {
    const result = await selection.provider.process(imageBuffer, strategy);
    const { provider: _provider, ...selectionMetadata } = selection;

    return {
      ...result,
      selection: selectionMetadata,
    };
  } catch (error) {
    if (selection.selected !== 'n3uralia') throw error;

    console.error('N3uralia provider failed, falling back to Sharp:', error);

    const fallbackProvider = new SharpProvider();
    const result = await fallbackProvider.process(imageBuffer, strategy);

    return {
      ...result,
      selection: {
        requested: selection.requested,
        selected: fallbackProvider.name,
        fallback: true,
        reason: 'Native N3uralia execution failed; request completed with Sharp',
      },
    };
  }
}
