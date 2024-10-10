
-- Create the user_video_relationships table
CREATE TABLE IF NOT EXISTS user_video_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  video_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, video_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_video_relationships_user_id ON user_video_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_video_relationships_video_id ON user_video_relationships(video_id);