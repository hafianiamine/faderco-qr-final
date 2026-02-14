-- Add profile_image_url column to virtual_business_cards table
ALTER TABLE public.virtual_business_cards
ADD COLUMN profile_image_url text;

-- Add comment
COMMENT ON COLUMN public.virtual_business_cards.profile_image_url IS 'URL of the profile/avatar image stored in Blob storage';
