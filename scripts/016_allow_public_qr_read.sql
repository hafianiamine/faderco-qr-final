-- Allow public/anonymous users to read active QR codes for redirects
-- This is necessary for QR code scanning to work without authentication

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Public can read active QR codes" ON public.qr_codes;

-- Create new policy that allows anyone to read active QR codes
CREATE POLICY "Public can read active QR codes"
  ON public.qr_codes FOR SELECT
  USING (is_active = true);

-- This policy allows:
-- 1. Anonymous users (not logged in) to read active QR codes
-- 2. The redirect endpoint to fetch QR code data without authentication
-- 3. QR codes to work when scanned from any device/browser
