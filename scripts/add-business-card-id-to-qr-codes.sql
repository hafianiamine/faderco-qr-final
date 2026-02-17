-- Add business_card_id column to qr_codes table to link QR codes to business cards
ALTER TABLE qr_codes 
ADD COLUMN business_card_id UUID REFERENCES virtual_business_cards(id) ON DELETE CASCADE;

-- Create an index on business_card_id for faster queries
CREATE INDEX idx_qr_codes_business_card_id ON qr_codes(business_card_id);
