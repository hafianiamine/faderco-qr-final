-- Add notification preference columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_scan_alerts BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_weekly_reports BOOLEAN DEFAULT true;
