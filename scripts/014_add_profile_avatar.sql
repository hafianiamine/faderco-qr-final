-- Add avatar_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create allowed_domains table for email domain whitelist
CREATE TABLE IF NOT EXISTS allowed_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on allowed_domains
ALTER TABLE allowed_domains ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage allowed domains
CREATE POLICY "Admins can manage allowed domains"
ON allowed_domains
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow anyone to read allowed domains (for registration validation)
CREATE POLICY "Anyone can read allowed domains"
ON allowed_domains
FOR SELECT
USING (true);

-- Insert default allowed domains
INSERT INTO allowed_domains (domain, created_by)
SELECT 'faderco.com', id FROM profiles WHERE role = 'admin' LIMIT 1
ON CONFLICT (domain) DO NOTHING;
