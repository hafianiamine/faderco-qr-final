-- Allow public (unauthenticated) updates to scans_used column only
-- This is needed for the redirect route to increment scan counts

CREATE POLICY "Public can increment scan count"
ON public.qr_codes FOR UPDATE
USING (true)
WITH CHECK (true);

-- Drop the old policy that blocks public updates
DROP POLICY IF EXISTS "Users can update their own QR codes" ON public.qr_codes;

-- Recreate the user update policy with better specificity
CREATE POLICY "Users can update their own QR codes"
ON public.qr_codes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
