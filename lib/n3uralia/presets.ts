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
