-- Clean up old system tables and keep only TV Ad system tables
-- This script removes all old dashboard tables and keeps only the new TV Ad system

-- Drop old system tables if they exist
DROP TABLE IF EXISTS csv_data CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS data_history CASCADE;
DROP TABLE IF EXISTS import_history CASCADE;

-- Keep only the TV Ad system tables:
-- tv_admin_profiles, tv_categories, tv_brands, tv_sub_brands, 
-- tv_channels, tv_deals, tv_special_events, tv_extra_packages, 
-- tv_payments, tv_ad_spots

-- Add any missing constraints or indexes for the TV Ad system
ALTER TABLE tv_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_sub_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_special_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_extra_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_ad_spots ENABLE ROW LEVEL SECURITY;

-- Ensure RLS policies exist for all TV Ad tables
DO $$
BEGIN
    -- Admin profiles policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tv_admin_profiles' AND policyname = 'Users can manage their own profile') THEN
        CREATE POLICY "Users can manage their own profile" ON tv_admin_profiles
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Categories policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tv_categories' AND policyname = 'Users can manage their own categories') THEN
        CREATE POLICY "Users can manage their own categories" ON tv_categories
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Brands policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tv_brands' AND policyname = 'Users can manage their own brands') THEN
        CREATE POLICY "Users can manage their own brands" ON tv_brands
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Sub-brands policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tv_sub_brands' AND policyname = 'Users can manage their own sub-brands') THEN
        CREATE POLICY "Users can manage their own sub-brands" ON tv_sub_brands
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Channels policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tv_channels' AND policyname = 'Users can manage their own channels') THEN
        CREATE POLICY "Users can manage their own channels" ON tv_channels
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Deals policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tv_deals' AND policyname = 'Users can manage their own deals') THEN
        CREATE POLICY "Users can manage their own deals" ON tv_deals
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Special events policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tv_special_events' AND policyname = 'Users can manage their own special events') THEN
        CREATE POLICY "Users can manage their own special events" ON tv_special_events
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Extra packages policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tv_extra_packages' AND policyname = 'Users can manage their own extra packages') THEN
        CREATE POLICY "Users can manage their own extra packages" ON tv_extra_packages
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Payments policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tv_payments' AND policyname = 'Users can manage their own payments') THEN
        CREATE POLICY "Users can manage their own payments" ON tv_payments
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Ad spots policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tv_ad_spots' AND policyname = 'Users can manage their own ad spots') THEN
        CREATE POLICY "Users can manage their own ad spots" ON tv_ad_spots
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Clean up any old functions or triggers that might be referencing deleted tables
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create updated_at trigger function for TV Ad system
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to TV Ad tables
CREATE TRIGGER update_tv_admin_profiles_updated_at BEFORE UPDATE ON tv_admin_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tv_categories_updated_at BEFORE UPDATE ON tv_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tv_brands_updated_at BEFORE UPDATE ON tv_brands FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tv_sub_brands_updated_at BEFORE UPDATE ON tv_sub_brands FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tv_channels_updated_at BEFORE UPDATE ON tv_channels FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tv_deals_updated_at BEFORE UPDATE ON tv_deals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tv_special_events_updated_at BEFORE UPDATE ON tv_special_events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tv_extra_packages_updated_at BEFORE UPDATE ON tv_extra_packages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tv_payments_updated_at BEFORE UPDATE ON tv_payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tv_ad_spots_updated_at BEFORE UPDATE ON tv_ad_spots FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
