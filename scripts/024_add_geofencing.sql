-- Add geofencing columns to qr_codes table
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS geofence_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS geofence_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS geofence_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS geofence_radius INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN public.qr_codes.geofence_enabled IS 'Whether location-based access control is enabled';
COMMENT ON COLUMN public.qr_codes.geofence_latitude IS 'Center latitude for geofence (decimal degrees)';
COMMENT ON COLUMN public.qr_codes.geofence_longitude IS 'Center longitude for geofence (decimal degrees)';
COMMENT ON COLUMN public.qr_codes.geofence_radius IS 'Geofence radius in meters';
