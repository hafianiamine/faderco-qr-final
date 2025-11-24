-- Create password_history table to prevent password reuse
CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created_at ON password_history(created_at DESC);

ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own password history"
  ON password_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage password history"
  ON password_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add password reset schedule settings
INSERT INTO settings (key, value) 
VALUES ('auto_password_reset_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value) 
VALUES ('auto_password_reset_days', '30')
ON CONFLICT (key) DO NOTHING;
