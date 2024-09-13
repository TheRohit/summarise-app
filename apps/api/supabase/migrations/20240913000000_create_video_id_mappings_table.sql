-- Create video_id_mappings table
CREATE TABLE IF NOT EXISTS public.video_id_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS video_id_mappings_video_id_idx ON public.video_id_mappings(video_id);
CREATE INDEX IF NOT EXISTS video_id_mappings_job_id_idx ON public.video_id_mappings(job_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.video_id_mappings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert video_id_mappings
CREATE POLICY "Allow authenticated users to insert video_id_mappings" ON public.video_id_mappings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to read video_id_mappings
CREATE POLICY "Allow authenticated users to read video_id_mappings" ON public.video_id_mappings
  FOR SELECT USING (auth.role() = 'authenticated');