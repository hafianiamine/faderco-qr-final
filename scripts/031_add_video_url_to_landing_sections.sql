-- Add video_url column to landing_sections table if it doesn't exist
ALTER TABLE landing_sections
ADD COLUMN IF NOT EXISTS video_url TEXT;
