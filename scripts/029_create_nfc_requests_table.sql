-- Create NFC requests table
CREATE TABLE IF NOT EXISTS nfc_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('new_card', 'replacement', 'additional')),
  reason TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'delivered', 'cancelled')),
  timeline_start TIMESTAMP,
  timeline_delivery TIMESTAMP,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX idx_nfc_requests_user_id ON nfc_requests(user_id);
CREATE INDEX idx_nfc_requests_status ON nfc_requests(status);

-- Enable RLS
ALTER TABLE nfc_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can see their own requests
CREATE POLICY "Users can see their own requests" 
  ON nfc_requests FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create requests
CREATE POLICY "Users can create requests"
  ON nfc_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can see all requests
CREATE POLICY "Admins can see all requests"
  ON nfc_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Admins can update requests
CREATE POLICY "Admins can update requests"
  ON nfc_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
