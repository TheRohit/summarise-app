-- Create transcriptions table
CREATE TABLE public.transcriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transcriptions_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes for faster queries
CREATE INDEX idx_transcriptions_user_id ON public.transcriptions(user_id);
CREATE INDEX idx_transcriptions_video_id ON public.transcriptions(video_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own transcriptions
CREATE POLICY "Users can insert their own transcriptions" ON public.transcriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to read their own transcriptions
CREATE POLICY "Users can view their own transcriptions" ON public.transcriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to update their own transcriptions
CREATE POLICY "Users can update their own transcriptions" ON public.transcriptions
  FOR UPDATE USING (auth.uid() = user_id);