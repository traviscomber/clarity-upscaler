/**
 * Supabase types for Clar1ty AI database schema
 */

export interface Profile {
  id: string; // UUID
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpscaleJob {
  id: string; // UUID
  user_id: string; // UUID
  original_filename: string;
  original_width: number;
  original_height: number;
  original_megapixels: number;
  detected_content: string[]; // Array of content types
  scale_factor: number; // 2, 4, 8, etc.
  preset_id: string; // 'portrait', 'architecture', 'nature', etc.
  creativity: number | null; // 0.1-0.9
  resemblance: number | null; // 0.3-1.6
  denoise_steps: number | null; // 8-28
  sharpen: number | null; // 0-10
  upscaled_width: number | null;
  upscaled_height: number | null;
  processing_time_ms: number | null;
  fidelity: number | null; // 0-1
  detail: number | null; // 0-1
  preservation: number | null; // 0-1
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface UpscaleImage {
  id: string; // UUID
  job_id: string; // UUID (FK to upscale_jobs)
  image_type: 'original' | 'upscaled'; // or 'preview', 'thumbnail'
  storage_path: string; // Supabase Storage path
  file_size_bytes: number | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      upscale_jobs: {
        Row: UpscaleJob;
        Insert: Omit<UpscaleJob, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UpscaleJob, 'id' | 'created_at'>>;
      };
      upscale_images: {
        Row: UpscaleImage;
        Insert: Omit<UpscaleImage, 'id' | 'created_at'>;
        Update: Partial<Omit<UpscaleImage, 'id' | 'created_at'>>;
      };
    };
  };
};
