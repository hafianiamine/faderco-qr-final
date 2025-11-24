-- Add force_password_reset field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS force_password_reset BOOLEAN DEFAULT false;

-- Add last_password_change field to track when password was last changed
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add max_concurrent_sessions to settings (admin can configure)
INSERT INTO settings (key, value) 
VALUES ('max_concurrent_sessions', '3')
ON CONFLICT (key) DO NOTHING;
