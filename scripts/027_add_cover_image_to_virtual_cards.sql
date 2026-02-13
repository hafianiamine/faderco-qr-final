-- Add cover image and customization fields to virtual business cards
ALTER TABLE virtual_business_cards 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS cover_color VARCHAR(7) DEFAULT '#6366F1',
ADD COLUMN IF NOT EXISTS avatar_bg_color VARCHAR(7) DEFAULT '#E0E7FF';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_virtual_cards_user_id ON virtual_business_cards(user_id);
