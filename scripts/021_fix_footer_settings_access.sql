-- Fix settings table RLS to allow public read access for footer_text
-- This allows the homepage footer to display without authentication

-- Drop existing policies
drop policy if exists "Admins can read settings" on public.settings;

-- Create new policies
-- Anyone can read footer_text setting (public access)
create policy "Public can read footer_text"
  on public.settings for select
  using (key = 'footer_text');

-- Admins can read all settings
create policy "Admins can read all settings"
  on public.settings for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
