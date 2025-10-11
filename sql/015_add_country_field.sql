-- Add country field to profiles table for filtering
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
