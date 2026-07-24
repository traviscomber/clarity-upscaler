-- ============================================================================
-- CLAR1TY AI - Database Initialization Script
-- Part 3: Create RLS Policies
-- ============================================================================
-- Execute this third to create Row Level Security policies
-- Each user can only access their own data
-- ============================================================================

-- RLS Policies for profiles
-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- RLS Policies for upscale_jobs
-- Users can view their own upscale jobs
CREATE POLICY "upscale_jobs_select_own" ON public.upscale_jobs 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own upscale jobs
CREATE POLICY "upscale_jobs_insert_own" ON public.upscale_jobs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own upscale jobs
CREATE POLICY "upscale_jobs_update_own" ON public.upscale_jobs 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own upscale jobs
CREATE POLICY "upscale_jobs_delete_own" ON public.upscale_jobs 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for upscale_images
-- Users can view images from their jobs
CREATE POLICY "upscale_images_select_own" ON public.upscale_images 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.upscale_jobs 
      WHERE id = job_id AND user_id = auth.uid()
    )
  );

-- Users can insert images for their jobs
CREATE POLICY "upscale_images_insert_own" ON public.upscale_images 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.upscale_jobs 
      WHERE id = job_id AND user_id = auth.uid()
    )
  );

-- Users can delete images from their jobs
CREATE POLICY "upscale_images_delete_own" ON public.upscale_images 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.upscale_jobs 
      WHERE id = job_id AND user_id = auth.uid()
    )
  );

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'upscale_jobs', 'upscale_images')
ORDER BY tablename, policyname;
