-- Manually approve the admin account
UPDATE public.profiles
SET status = 'approved', role = 'admin'
WHERE email = 'admin@fadercoqr.com';
