-- ============================================================================
-- CLAR1TY AI - Database Initialization Script
-- Part 2: Enable Row Level Security (RLS)
-- ============================================================================
-- Execute this second to enable RLS on all tables
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upscale_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upscale_images ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'upscale_jobs', 'upscale_images');
