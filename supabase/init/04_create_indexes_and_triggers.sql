-- ============================================================================
-- CLAR1TY AI - Database Initialization Script
-- Part 4: Create Indexes and Triggers
-- ============================================================================
-- Execute this fourth to create indexes for performance and triggers for
-- automation (auto-create profile on user signup)
-- ============================================================================

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes for upscale_jobs
CREATE INDEX IF NOT EXISTS idx_upscale_jobs_user_id 
  ON public.upscale_jobs(user_id);

CREATE INDEX IF NOT EXISTS idx_upscale_jobs_created_at 
  ON public.upscale_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_upscale_jobs_status 
  ON public.upscale_jobs(status);

-- Performance indexes for upscale_images
CREATE INDEX IF NOT EXISTS idx_upscale_images_job_id 
  ON public.upscale_images(job_id);

CREATE INDEX IF NOT EXISTS idx_upscale_images_created_at 
  ON public.upscale_images(created_at DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Create function to auto-create profile on user signup
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify indexes were created
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verify function was created
SELECT 
  proname,
  prosecdef,
  provolatile
FROM pg_proc 
WHERE proname = 'handle_new_user' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Verify trigger was created
SELECT 
  trigger_schema,
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name = 'on_auth_user_created';

SELECT 'All indexes and triggers created successfully' AS status;
