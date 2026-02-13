-- Create card_analytics table to track views and scans
CREATE TABLE IF NOT EXISTS card_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES virtual_business_cards(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'view', 'scan', 'contact_saved'
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
  browser VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_card_analytics_card_id ON card_analytics(card_id);
CREATE INDEX IF NOT EXISTS idx_card_analytics_created_at ON card_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_card_analytics_event_type ON card_analytics(event_type);

-- Add RLS policies
ALTER TABLE card_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only view analytics for their own cards
CREATE POLICY "Users can view their card analytics" ON card_analytics
  FOR SELECT
  USING (
    card_id IN (
      SELECT id FROM virtual_business_cards 
      WHERE user_id = auth.uid()
    )
  );

-- Only service role can insert analytics
CREATE POLICY "Service role can insert analytics" ON card_analytics
  FOR INSERT
  WITH CHECK (TRUE);
