-- Add advanced QR code features
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS logo_size INTEGER DEFAULT 12 CHECK (logo_size >= 5 AND logo_size <= 25),
ADD COLUMN IF NOT EXISTS logo_outline_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS scan_limit INTEGER,
ADD COLUMN IF NOT EXISTS scans_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN public.qr_codes.logo_size IS 'Logo size as percentage of QR code (5-25%)';
COMMENT ON COLUMN public.qr_codes.logo_outline_color IS 'Color of outline around logo';
COMMENT ON COLUMN public.qr_codes.scan_limit IS 'Maximum number of scans allowed (NULL = unlimited)';
COMMENT ON COLUMN public.qr_codes.scans_used IS 'Number of times this QR code has been scanned';
COMMENT ON COLUMN public.qr_codes.scheduled_start IS 'When this QR code becomes active';
COMMENT ON COLUMN public.qr_codes.scheduled_end IS 'When this QR code expires';

-- Create index for scheduled queries
CREATE INDEX IF NOT EXISTS idx_qr_codes_scheduled ON public.qr_codes(scheduled_start, scheduled_end);
