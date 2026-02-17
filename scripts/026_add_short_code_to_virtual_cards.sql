-- Add short_code column to virtual_business_cards table
ALTER TABLE virtual_business_cards 
ADD COLUMN IF NOT EXISTS short_code TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_virtual_business_cards_short_code ON virtual_business_cards(short_code);
