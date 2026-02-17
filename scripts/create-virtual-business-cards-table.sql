-- Create virtual_business_cards table
CREATE TABLE IF NOT EXISTS virtual_business_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_id UUID UNIQUE REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  logo_url TEXT,
  theme_color TEXT DEFAULT '#000000',
  background_style TEXT DEFAULT 'light',
  card_layout TEXT DEFAULT 'modern',
  vcard_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_virtual_business_cards_user_id ON virtual_business_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_business_cards_qr_code_id ON virtual_business_cards(qr_code_id);

-- Enable RLS
ALTER TABLE virtual_business_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own business cards"
  ON virtual_business_cards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business cards"
  ON virtual_business_cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business cards"
  ON virtual_business_cards
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business cards"
  ON virtual_business_cards
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active business cards"
  ON virtual_business_cards
  FOR SELECT
  USING (true);
