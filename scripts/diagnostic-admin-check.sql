-- Diagnostic script to check admin user setup
-- This will show us what's actually in the database

-- Check all users with admin role
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- Check the expected admin account
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at
FROM profiles
WHERE email = 'admin@fadercoqr.com';

-- Check all users ordered by creation
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Count users by role
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role;
