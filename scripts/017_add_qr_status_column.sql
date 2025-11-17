-- Add status column to qr_codes table to track deleted QR codes
-- We'll use: 'active', 'inactive', 'deleted'
alter table public.qr_codes
add column if not exists status text default 'active' check (status in ('active', 'inactive', 'deleted'));

-- Migrate existing data: set status based on is_active
update public.qr_codes
set status = case 
  when is_active = true then 'active'
  else 'inactive'
end
where status = 'active'; -- only update records that haven't been updated yet

-- Add index for better query performance
create index if not exists idx_qr_codes_status on public.qr_codes(status);

-- Add comment for documentation
comment on column public.qr_codes.status is 'Status of QR code: active, inactive, or deleted';
