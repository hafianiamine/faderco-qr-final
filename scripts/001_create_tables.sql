-- Create profiles table for extended user information
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create QR codes table
create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  destination_url text not null,
  short_code text not null unique,
  short_url text not null,
  qr_image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create scans table for analytics
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  qr_code_id uuid not null references public.qr_codes(id) on delete cascade,
  scanned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  country text,
  city text,
  latitude numeric,
  longitude numeric,
  device_type text,
  browser text,
  os text,
  referrer text,
  ip_address text
);

-- Create indexes for better query performance
create index if not exists idx_qr_codes_user_id on public.qr_codes(user_id);
create index if not exists idx_qr_codes_short_code on public.qr_codes(short_code);
create index if not exists idx_scans_qr_code_id on public.scans(qr_code_id);
create index if not exists idx_scans_scanned_at on public.scans(scanned_at);
create index if not exists idx_profiles_status on public.profiles(status);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.qr_codes enable row level security;
alter table public.scans enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- QR codes policies
create policy "Users can view their own QR codes"
  on public.qr_codes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own QR codes"
  on public.qr_codes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own QR codes"
  on public.qr_codes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own QR codes"
  on public.qr_codes for delete
  using (auth.uid() = user_id);

create policy "Admins can view all QR codes"
  on public.qr_codes for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Scans policies (read-only for users, admins can see all)
create policy "Users can view scans for their QR codes"
  on public.scans for select
  using (
    exists (
      select 1 from public.qr_codes
      where qr_codes.id = scans.qr_code_id
      and qr_codes.user_id = auth.uid()
    )
  );

create policy "Public can insert scans"
  on public.scans for insert
  with check (true);

create policy "Admins can view all scans"
  on public.scans for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
