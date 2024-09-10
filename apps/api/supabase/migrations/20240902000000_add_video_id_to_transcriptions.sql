-- Add videoId column to transcriptions table
ALTER TABLE public.transcriptions
ADD COLUMN video_id UUID NOT NULL;

-- Add index for faster queries on video_id
CREATE INDEX idx_transcriptions_video_id ON public.transcriptions(video_id);

-- Update the existing policies to include video_id
DROP POLICY IF EXISTS "Users can insert their own transcriptions" ON public.transcriptions;
CREATE POLICY "Users can insert their own transcriptions" ON public.transcriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own transcriptions" ON public.transcriptions;
CREATE POLICY "Users can view their own transcriptions" ON public.transcriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Add a new policy to allow users to update their own transcriptions
CREATE POLICY "Users can update their own transcriptions" ON public.transcriptions
  FOR UPDATE USING (auth.uid() = user_id);