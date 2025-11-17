-- Create allowed_domains table if it doesn't exist
CREATE TABLE IF NOT EXISTS allowed_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE allowed_domains ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage domains
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

-- Allow everyone to read domains (needed for registration validation)
CREATE POLICY "Anyone can read allowed domains"
ON allowed_domains
FOR SELECT
USING (true);

-- Insert default domains
INSERT INTO allowed_domains (domain) VALUES
  ('faderco.com'),
  ('faderco.dz'),
  ('fadercoqr.com')
ON CONFLICT (domain) DO NOTHING;
