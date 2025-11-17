-- Create admin account directly in Supabase Auth
-- This script creates the admin user with proper authentication

-- First, we need to create the user in auth.users
-- Note: In Supabase, you typically can't insert directly into auth.users via SQL
-- Instead, use the Supabase Dashboard or API to create the user

-- However, we can ensure the profile is set up correctly when the admin signs up
-- The trigger from script 006 will handle setting the admin role

-- Alternative: Create admin via Supabase Auth API
-- You can run this in a server action or API route:

/*
const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@fadercoqr.com',
  password: 'Admin@1234',
  email_confirm: true,
  user_metadata: {
    role: 'admin'
  }
})
*/

-- For now, ensure the trigger is working correctly
-- When admin@fadercoqr.com signs up, they will automatically become admin

-- Verify the trigger exists
select 
  trigger_name, 
  event_manipulation, 
  event_object_table
from information_schema.triggers
where trigger_name = 'on_admin_user_created';
