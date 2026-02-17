-- FIX: Ensure admin@fadercoqr.com has admin role and approved status
-- This script will update the admin account to have the correct role and status

-- First, find and update the admin account
UPDATE profiles
SET 
  role = 'admin',
  status = 'approved',
  updated_at = NOW()
WHERE email = 'admin@fadercoqr.com'
  AND role != 'admin';

-- Verify the update
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  updated_at
FROM profiles
WHERE email = 'admin@fadercoqr.com';

-- Count admins now
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role;
