# Supabase Setup - Clar1ty AI

## Project Configuration

- **Project Name**: Clar1ty AI
- **Database Name**: Clar1ty AI
- **Instance**: supabase-pink-ocean
- **Resource ID**: uikvqvqkwgtwiyzttxgv
- **Region**: (check Supabase dashboard for exact region)

## Integration Status

✅ Supabase is connected to this Vercel project via the integration panel.

Environment variables are automatically available:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

## Database Schema

### Tables

1. **public.profiles**
   - User profile data
   - Auto-created on user signup via trigger
   - RLS: Users can only access their own profile

2. **public.upscale_jobs**
   - History of all upscaling operations
   - Stores image metadata, preset parameters, results
   - RLS: Users can only access their own jobs

3. **public.upscale_images**
   - References to stored images (original + upscaled)
   - Links to storage via `storage_path`
   - RLS: Users can only access images from their own jobs

### RLS Policies

All tables have Row Level Security enabled:
- Users can only SELECT/INSERT/UPDATE/DELETE their own data
- `auth.uid()` is used to enforce user isolation
- upscale_images uses FK relationships for access control

### Indexes

- `idx_upscale_jobs_user_id` — Fast lookup by user
- `idx_upscale_jobs_created_at` — Latest jobs first
- `idx_upscale_images_job_id` — Find images for a job

## Running Migrations

To apply the schema:

```bash
# Via Supabase CLI (if installed):
supabase db push

# Via v0 (using Supabase MCP):
# The schema is in supabase/migrations/0001_clar1ty_schema.sql
# Execute it through the Supabase dashboard SQL editor or v0 MCP
```

## Client Usage

### Browser (Client-side)

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Fetch user's upscale jobs
const { data: jobs } = await supabase
  .from('upscale_jobs')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

### Server-side (API Routes / Server Actions)

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()

// Get authenticated user (from request headers/cookies)
const { data: { user } } = await supabase.auth.getUser()

// Insert new upscale job
const { data, error } = await supabase
  .from('upscale_jobs')
  .insert({
    user_id: user.id,
    original_filename: 'image.png',
    original_width: 1920,
    original_height: 1080,
    original_megapixels: 2.1,
    scale_factor: 4,
    preset_id: 'architecture',
    // ... other fields
  })
  .select()
```

## Authentication

### Sign Up / Login

The app includes auth pages at:
- `/auth/sign-up` — User registration
- `/auth/login` — User login
- `/auth/callback` — OAuth/email link callback (required)
- `/auth/error` — Auth error page

### Email Confirmation

By default, users must confirm their email before they can perform CRUD operations on RLS-protected tables. This is enforced by the `email_confirmed_at` field in `auth.users`.

**Note**: Profile creation happens via a database trigger with `SECURITY DEFINER` privileges, so it works even before email confirmation.

### Session Management

Sessions are handled by middleware (`middleware.ts`) which:
- Refreshes tokens before they expire
- Sets/updates cookies automatically
- Handles auth callback redirects

## Storage Integration

To store original and upscaled images:

```bash
# Create a storage bucket (via Supabase dashboard):
# - Name: upscale-images
# - Access: Private (users can only access their own files)

# Or programmatically:
const { data, error } = await supabase.storage
  .createBucket('upscale-images', {
    public: false,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  })
```

Usage in code:

```typescript
// Upload original image
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('upscale-images')
  .upload(`${user.id}/originals/${filename}`, file, {
    cacheControl: '3600',
    upsert: false
  })

// Create upscale job with storage path
const { data: job } = await supabase
  .from('upscale_jobs')
  .insert({
    user_id: user.id,
    // ... job data
  })
  .select()

// Upload upscaled image
await supabase.storage
  .from('upscale-images')
  .upload(`${user.id}/upscaled/${job.id}.png`, upscaledBlob)
```

## API Integration Points

### POST /api/analyze
Current: Anonymous (no auth required)
Future: Store analysis results in `upscale_jobs`

```typescript
// Example response to store:
const job = {
  user_id: user.id,
  original_filename,
  original_width: analysis.width,
  original_height: analysis.height,
  original_megapixels: analysis.megapixels,
  detected_content: analysis.detectedContent,
  scale_factor: 4,
  preset_id: analysis.recommendedPresetId
}
```

### POST /api/enhance
Current: Anonymous (no auth required)
Future: Update `upscale_jobs` with results, store images in storage + `upscale_images`

```typescript
// Update job with results
const { error } = await supabase
  .from('upscale_jobs')
  .update({
    upscaled_width: result.width,
    upscaled_height: result.height,
    processing_time_ms: result.processingTime,
    fidelity: result.metrics.fidelity,
    detail: result.metrics.detail,
    preservation: result.metrics.preservation,
    status: 'completed'
  })
  .eq('id', jobId)
```

## Troubleshooting

### Connection Issues

If you see "ECONNREFUSED" errors:
1. Check that Supabase is connected in Vercel project settings
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Restart the dev server: `pnpm dev`

### RLS Policy Errors

If you get "new row violates row-level security policy":
1. Ensure `user_id` is set to `auth.uid()` (or current user's ID)
2. Check that the user is authenticated (not anonymous)
3. Verify the policy allows the operation (SELECT/INSERT/UPDATE/DELETE)

### Email Confirmation

If a user can't insert records after signing up:
1. Check if email confirmation is required (default: yes)
2. Direct users to confirm their email first
3. Or disable email confirmation in Supabase auth settings (not recommended for production)

## Next Steps

1. Apply migrations to Supabase database
2. Add auth pages (sign-up, login)
3. Create protected routes (require authentication)
4. Add upscaling history page (list user's jobs)
5. Integrate Supabase Storage for image uploads
6. Add user profile page

## Vercel Deployment

When deploying to Vercel:
1. Supabase environment variables are automatically included
2. No additional setup needed on Vercel side
3. Test the connection in production before going live
