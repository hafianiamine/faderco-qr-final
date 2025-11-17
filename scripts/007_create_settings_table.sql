-- Create settings table for platform configuration
-- This table stores key-value pairs for platform-wide settings

create table if not exists public.settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.settings enable row level security;

-- Create policies
-- Only admins can read settings
create policy "Admins can read settings"
  on public.settings for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Only admins can insert settings
create policy "Admins can insert settings"
  on public.settings for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Only admins can update settings
create policy "Admins can update settings"
  on public.settings for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_settings_updated
  before update on public.settings
  for each row
  execute function public.handle_updated_at();

-- Insert default footer text
insert into public.settings (key, value)
values ('footer_text', '© 2025 FADERCO QR. All rights reserved.')
on conflict (key) do nothing;
