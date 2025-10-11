-- Add customization columns to qr_codes table
alter table public.qr_codes
add column if not exists qr_color_dark text default '#000000',
add column if not exists qr_color_light text default '#FFFFFF',
add column if not exists qr_logo_url text;

-- Add comment for documentation
comment on column public.qr_codes.qr_color_dark is 'Dark color for QR code (foreground)';
comment on column public.qr_codes.qr_color_light is 'Light color for QR code (background)';
comment on column public.qr_codes.qr_logo_url is 'Optional logo to embed in center of QR code';
