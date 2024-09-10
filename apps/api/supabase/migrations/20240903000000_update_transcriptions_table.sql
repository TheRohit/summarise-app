-- Rename videoId column to video_id if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'transcriptions' AND column_name = 'videoid') THEN
    ALTER TABLE public.transcriptions RENAME COLUMN videoid TO video_id;
  END IF;
END $$;

-- Ensure video_id column exists and is of type TEXT
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'transcriptions' AND column_name = 'video_id') THEN
    ALTER TABLE public.transcriptions ADD COLUMN video_id TEXT NOT NULL;
  ELSE
    ALTER TABLE public.transcriptions ALTER COLUMN video_id TYPE TEXT;
  END IF;
END $$;

-- Recreate the index on video_id
DROP INDEX IF EXISTS idx_transcriptions_video_id;
CREATE INDEX idx_transcriptions_video_id ON public.transcriptions(video_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can insert their own transcriptions" ON public.transcriptions;
CREATE POLICY "Users can insert their own transcriptions" ON public.transcriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own transcriptions" ON public.transcriptions;
CREATE POLICY "Users can view their own transcriptions" ON public.transcriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own transcriptions" ON public.transcriptions;
CREATE POLICY "Users can update their own transcriptions" ON public.transcriptions
  FOR UPDATE USING (auth.uid() = user_id);