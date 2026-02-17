-- Add vcard_data column to qr_codes table for storing business card vCard data separately
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS vcard_data TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN qr_codes.vcard_data IS 'Stores vCard data for business card QR codes. When present, this is a business card and the destination_url will be null.';
