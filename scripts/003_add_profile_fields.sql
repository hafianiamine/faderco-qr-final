-- Add phone number, company, and department fields to profiles table
alter table public.profiles
add column if not exists phone_number text,
add column if not exists company text,
add column if not exists department text;
