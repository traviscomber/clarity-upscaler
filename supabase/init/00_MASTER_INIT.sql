-- ============================================================================
-- CLAR1TY AI - Complete Database Initialization Script
-- ============================================================================
-- Execute this single script to initialize the entire database
-- Contains all 4 parts in one file for convenience
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.profiles IS 'User profile data, auto-created on signup';

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

CREATE TABLE IF NOT EXISTS public.upscale_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.upscale_jobs(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.upscale_images IS 'References to original and upscaled images stored in Supabase Storage';

-- ============================================================================
-- PART 2: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upscale_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upscale_images ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 3: CREATE RLS POLICIES
-- ============================================================================

-- Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- Policies for upscale_jobs
CREATE POLICY "upscale_jobs_select_own" ON public.upscale_jobs 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "upscale_jobs_insert_own" ON public.upscale_jobs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "upscale_jobs_update_own" ON public.upscale_jobs 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "upscale_jobs_delete_own" ON public.upscale_jobs 
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for upscale_images
CREATE POLICY "upscale_images_select_own" ON public.upscale_images 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.upscale_jobs 
      WHERE id = job_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "upscale_images_insert_own" ON public.upscale_images 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.upscale_jobs 
      WHERE id = job_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "upscale_images_delete_own" ON public.upscale_images 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.upscale_jobs 
      WHERE id = job_id AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 4: CREATE INDEXES AND TRIGGERS
-- ============================================================================

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_upscale_jobs_user_id 
  ON public.upscale_jobs(user_id);

CREATE INDEX IF NOT EXISTS idx_upscale_jobs_created_at 
  ON public.upscale_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_upscale_jobs_status 
  ON public.upscale_jobs(status);

CREATE INDEX IF NOT EXISTS idx_upscale_images_job_id 
  ON public.upscale_images(job_id);

CREATE INDEX IF NOT EXISTS idx_upscale_images_created_at 
  ON public.upscale_images(created_at DESC);

-- Trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger that fires after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
  'Clar1ty AI Database Initialized Successfully' AS status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'upscale_jobs', 'upscale_images')) AS tables_created,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%') AS indexes_created,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') AS rls_policies_created;

-- Final summary
SELECT 
  'Schema' AS component,
  COUNT(*) AS count,
  'Tables' AS type
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('profiles', 'upscale_jobs', 'upscale_images')

UNION ALL

SELECT 
  'Indexes' AS component,
  COUNT(*) AS count,
  'Performance' AS type
FROM pg_indexes 
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'

UNION ALL

SELECT 
  'RLS Policies' AS component,
  COUNT(*) AS count,
  'Security' AS type
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Triggers' AS component,
  COUNT(*) AS count,
  'Automation' AS type
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
