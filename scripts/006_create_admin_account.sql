-- Create admin user account
-- Note: This creates the user in auth.users and sets up the profile
-- Password: Admin@1234
-- Email: admin@fadercoqr.com

-- Insert into auth.users (Supabase will handle password hashing)
-- This is a placeholder - the actual user creation should be done via Supabase Auth API
-- For now, we'll just ensure the profile is ready when the user signs up

-- Create a function to set admin role after signup
create or replace function public.handle_admin_user()
returns trigger as $$
begin
  -- Check if the email is the admin email
  if new.email = 'admin@fadercoqr.com' then
    update public.profiles
    set role = 'admin', status = 'approved'
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically set admin role
drop trigger if exists on_admin_user_created on public.profiles;
create trigger on_admin_user_created
  after insert on public.profiles
  for each row
  execute function public.handle_admin_user();

-- Note: To create the actual admin account, sign up with:
-- Email: admin@fadercoqr.com
-- Password: Admin@1234
-- The trigger will automatically set the role to 'admin' and status to 'approved'
