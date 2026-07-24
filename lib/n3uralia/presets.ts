/**
 * Philz-inspired presets for upscaling profiles.
 * Based on predict.py parameters: creativity, resemblance, denoise_steps, sharpen.
 */

export interface PhilzPreset {
  id: string;
  name: string;
  description: string;
  creativity: number; // 0.3–0.9: hallucination level
  resemblance: number; // 0.3–1.6: preservation of original
  denoise_steps: number; // 1–100: detail recovery passes
  sharpen: number; // 0–10: post-sharpening
  dynamic: number; // 1–50: tonal range (HDR)
  tile_overlap: number; // 16–256: tiling for large images
  recommended_for: string[];
}

export const PHILZ_PRESETS: Record<string, PhilzPreset> = {
  portrait: {
    id: 'portrait',
    name: 'Portrait Mode',
    description: 'Preserve facial features and identity. Low creativity, high resemblance.',
    creativity: 0.10,
    resemblance: 1.2,
    denoise_steps: 22,
    sharpen: 1.5,
    dynamic: 4,
    tile_overlap: 112,
    recommended_for: ['face', 'portrait', 'people'],
  },

  architecture: {
    id: 'architecture',
    name: 'Architecture',
    description: 'Clean geometry and sharp edges. Moderate creativity, balanced resemblance.',
    creativity: 0.20,
    resemblance: 0.95,
    denoise_steps: 20,
    sharpen: 3.0,
    dynamic: 6,
    tile_overlap: 128,
    recommended_for: ['architecture', 'building', 'geometric'],
  },

  nature: {
    id: 'nature',
    name: 'Nature Enhanced',
    description: 'Bring out natural detail and textures. Moderate creativity for organic upscaling.',
    creativity: 0.25,
    resemblance: 0.90,
    denoise_steps: 18,
    sharpen: 2.5,
    dynamic: 8,
    tile_overlap: 120,
    recommended_for: ['nature', 'landscape', 'wildlife', 'organic'],
  },

  full_spectrum: {
    id: 'full_spectrum',
    name: 'Full Spectrum',
    description: 'Balanced upscaling with detail hallucination. Versatile for most content.',
    creativity: 0.35,
    resemblance: 0.60,
    denoise_steps: 18,
    sharpen: 2.0,
    dynamic: 6,
    tile_overlap: 112,
    recommended_for: ['general', 'mixed', 'all'],
  },

  vivid: {
    id: 'vivid',
    name: 'Vivid Enhancement',
    description: 'Aggressive detail recovery with high color saturation. Maximum creativity.',
    creativity: 0.55,
    resemblance: 0.50,
    denoise_steps: 16,
    sharpen: 4.5,
    dynamic: 12,
    tile_overlap: 96,
    recommended_for: ['artistic', 'fantasy', 'stylized', 'cosmic'],
  },

  fast: {
    id: 'fast',
    name: 'Fast Mode',
    description: 'Quick upscaling with minimal processing. Best for speed.',
    creativity: 0.15,
    resemblance: 0.80,
    denoise_steps: 8,
    sharpen: 1.0,
    dynamic: 3,
    tile_overlap: 80,
    recommended_for: ['preview', 'test', 'speed'],
  },
};

/**
 * Get preset by ID, or return default (Full Spectrum).
 */
export function getPreset(presetId: string): PhilzPreset {
  return PHILZ_PRESETS[presetId] || PHILZ_PRESETS.full_spectrum;
}

/**
 * Get recommended presets based on detected content.
 */
export function getRecommendedPresets(
  detectedContent: string[]
): PhilzPreset[] {
  const recommended = new Set<PhilzPreset>();

  for (const content of detectedContent) {
    for (const preset of Object.values(PHILZ_PRESETS)) {
      if (preset.recommended_for.some((r) => content.toLowerCase().includes(r))) {
        recommended.add(preset);
      }
    }
  }

  // Always include Full Spectrum as fallback
  recommended.add(PHILZ_PRESETS.full_spectrum);

  return Array.from(recommended);
}

/**
 * Recommendation result with preset and reasoning.
 */
export interface PresetRecommendation {
  preset: PhilzPreset;
  reason: string;
  confidence: number; // 0–1: how confident this is the best choice
}

/**
 * Smart recommendation engine: Analyzes image characteristics and recommends
 * optimal preset with reasoning. Considers:
 * - Megapixels and quality level (low MP/quality → aggressive detail hallucination)
 * - Detected content (face → Portrait, architecture → Architecture, etc.)
 * - Scale factor (high scale like 8x → more aggressive)
 */
export function recommendPreset(
  megapixels: number,
  quality: 'low' | 'medium' | 'high' | 'ultra',
  detectedContent: string[],
  scaleFactor: number = 4
): PresetRecommendation {
  const contentLower = detectedContent.map((c) => c.toLowerCase());

  // Rule 1: Detect specific content and map to preset
  if (contentLower.some((c) => c.includes('face') || c.includes('portrait'))) {
    return {
      preset: PHILZ_PRESETS.portrait,
      reason: `Face detected. Portrait Mode preserves facial identity.`,
      confidence: 0.95,
    };
  }

  if (contentLower.some((c) => c.includes('architecture') || c.includes('building'))) {
    return {
      preset: PHILZ_PRESETS.architecture,
      reason: `Architecture detected. Clean geometry and sharp edges mode.`,
      confidence: 0.9,
    };
  }

  if (contentLower.some((c) => c.includes('nature') || c.includes('landscape') || c.includes('wildlife'))) {
    return {
      preset: PHILZ_PRESETS.nature,
      reason: `Nature/landscape detected. Enhanced for organic textures.`,
      confidence: 0.88,
    };
  }

  // Rule 2: Low quality/megapixels → aggressive (Vivid) for maximum detail
  if (quality === 'low' && megapixels < 2) {
    return {
      preset: PHILZ_PRESETS.vivid,
      reason: `Low quality (${megapixels.toFixed(1)}MP). Vivid mode adds aggressive detail recovery.`,
      confidence: 0.85,
    };
  }

  // Rule 3: High scale factor (8x) → slightly more aggressive
  if (scaleFactor >= 8) {
    return {
      preset: PHILZ_PRESETS.vivid,
      reason: `Large scale factor (${scaleFactor}x). Vivid mode handles high upscaling better.`,
      confidence: 0.8,
    };
  }

  // Rule 4: Ultra quality → Full Spectrum (balanced)
  if (quality === 'ultra' && megapixels > 10) {
    return {
      preset: PHILZ_PRESETS.full_spectrum,
      reason: `Ultra quality image. Balanced Full Spectrum mode preserves detail.`,
      confidence: 0.85,
    };
  }

  // Rule 5: Medium quality + medium MP → Nature or Full Spectrum
  if (quality === 'medium' && megapixels >= 2 && megapixels < 8) {
    return {
      preset: PHILZ_PRESETS.nature,
      reason: `Medium quality mid-resolution image. Nature Enhanced mode recommended.`,
      confidence: 0.75,
    };
  }

  // Default fallback
  return {
    preset: PHILZ_PRESETS.full_spectrum,
    reason: `Balanced upscaling for your image. Customize if needed.`,
    confidence: 0.7,
  };
}
