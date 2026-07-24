import { createClient } from '@/lib/supabase/client';
import type { EnhancementStrategy } from '@/lib/n3uralia/engine';

/**
 * Save upscaling job to Supabase
 */
export async function saveUpscaleJob(
  userId: string,
  originalFile: {
    name: string;
    width: number;
    height: number;
    megapixels: number;
  },
  analysis: {
    detectedContent: string[];
    quality: string;
  },
  strategy: EnhancementStrategy,
  result: {
    upscaledWidth: number;
    upscaledHeight: number;
    processingTimeMs: number;
    fidelity: number;
    detail: number;
    preservation: number;
  }
) {
  const supabase = createClient();

  const { data, error } = await supabase.from('upscale_jobs').insert([
    {
      user_id: userId,
      original_filename: originalFile.name,
      original_width: originalFile.width,
      original_height: originalFile.height,
      original_megapixels: originalFile.megapixels,
      detected_content: analysis.detectedContent,
      scale_factor: strategy.scaleFactor,
      preset_id: strategy.presetId || 'full_spectrum',
      creativity: strategy.creativity ?? 0.35,
      resemblance: strategy.resemblance ?? 0.6,
      denoise_steps: strategy.denoise_steps ?? 18,
      sharpen: strategy.sharpen ?? 2.0,
      upscaled_width: result.upscaledWidth,
      upscaled_height: result.upscaledHeight,
      processing_time_ms: result.processingTimeMs,
      fidelity: result.fidelity,
      detail: result.detail,
      preservation: result.preservation,
      status: 'completed',
    },
  ]).select();

  if (error) {
    console.error('[Upscale Service] Error saving job:', error);
    return null;
  }

  return data?.[0];
}

/**
 * Get user's upscale history
 */
export async function getUpscaleHistory(userId: string, limit = 20) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('upscale_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Upscale Service] Error fetching history:', error);
    return [];
  }

  return data || [];
}

/**
 * Get upscale job by ID
 */
export async function getUpscaleJob(jobId: string) {
  const supabase = createClient();

  const { data, error } = await supabase.from('upscale_jobs').select('*').eq('id', jobId).single();

  if (error) {
    console.error('[Upscale Service] Error fetching job:', error);
    return null;
  }

  return data;
}
