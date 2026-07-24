-- Clar1ty AI Database Schema
-- Created for upscaling history, user profiles, and image storage

-- Create public.profiles table (references auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create public.upscale_jobs table (history of upscalings)
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

-- Create public.upscale_images table (store image data references)
CREATE TABLE IF NOT EXISTS public.upscale_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.upscale_jobs(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upscale_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upscale_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for upscale_jobs
CREATE POLICY "Users can view their own upscale jobs" ON public.upscale_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own upscale jobs" ON public.upscale_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own upscale jobs" ON public.upscale_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own upscale jobs" ON public.upscale_jobs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for upscale_images
CREATE POLICY "Users can view images from their jobs" ON public.upscale_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.upscale_jobs WHERE id = job_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert images for their jobs" ON public.upscale_images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.upscale_jobs WHERE id = job_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete images from their jobs" ON public.upscale_images FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.upscale_jobs WHERE id = job_id AND user_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_upscale_jobs_user_id ON public.upscale_jobs(user_id);
CREATE INDEX idx_upscale_jobs_created_at ON public.upscale_jobs(created_at DESC);
CREATE INDEX idx_upscale_images_job_id ON public.upscale_images(job_id);

-- Create trigger for auto-creating profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', NULL))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
