-- Add title column to transcriptions table
ALTER TABLE transcriptions ADD COLUMN title TEXT;

-- Update existing rows with a default title if needed
UPDATE transcriptions SET title = 'Untitled Transcription' WHERE title IS NULL;

-- Make the title column NOT NULL after setting a default value
ALTER TABLE transcriptions ALTER COLUMN title SET NOT NULL;