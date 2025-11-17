-- Manually confirm the admin email address
-- This updates the auth.users table to mark the email as confirmed

UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'admin@fadercoqr.com';
