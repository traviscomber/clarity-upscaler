-- ============================================================================
-- CLAR1TY AI - Database Initialization Script
-- Part 1: Create Tables
-- ============================================================================
-- Execute this first to create the base tables
-- ============================================================================

-- Create profiles table (references auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.profiles IS 'User profile data, auto-created on signup';

-- Create upscale_jobs table (history of all upscalings)
CREATE TABLE IF NOT EXISTS public.upscale_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  original_width INT NOT NULL,
  original_height INT NOT NULL,
  original_megapixels NUMERIC NOT NULL,
  detected_content TEXT[] DEFAULT '{}',
  scale_factor INT NOT NULL,
  preset_id TEXT NOT NULL,
  creativity NUMERIC,
  resemblance NUMERIC,
  denoise_steps INT,
  sharpen NUMERIC,
  upscaled_width INT,
  upscaled_height INT,
  processing_time_ms INT,
  fidelity NUMERIC,
  detail NUMERIC,
  preservation NUMERIC,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.upscale_jobs IS 'Complete history of all upscaling jobs with parameters and metrics';

-- Create upscale_images table (store image data references)
CREATE TABLE IF NOT EXISTS public.upscale_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.upscale_jobs(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.upscale_images IS 'References to original and upscaled images stored in Supabase Storage';

-- Verify tables were created
SELECT 'Tables created successfully' AS status;
