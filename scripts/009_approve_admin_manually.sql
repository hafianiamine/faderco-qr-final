-- Manually approve and verify the admin account
-- This bypasses email verification and admin approval for admin@fadercoqr.com

-- Update the profile to set admin role and approved status
UPDATE public.profiles
SET 
  role = 'admin',
  status = 'approved'
WHERE email = 'admin@fadercoqr.com';

-- If you need to bypass email verification in Supabase auth.users table
-- Note: This requires service role access and may not work in all environments
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE email = 'admin@fadercoqr.com';
