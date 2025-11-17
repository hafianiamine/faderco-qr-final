-- TV Ad Scheduling System Database Schema
-- This creates all the necessary tables for the new TV ad scheduling system

-- Admin profiles table
CREATE TABLE IF NOT EXISTS tv_admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    profile_image_url TEXT,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand categories/families
CREATE TABLE IF NOT EXISTS tv_brand_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES tv_admin_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands under categories
CREATE TABLE IF NOT EXISTS tv_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES tv_brand_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sub-brands under brands
CREATE TABLE IF NOT EXISTS tv_sub_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES tv_brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TV channel deals/contracts
CREATE TABLE IF NOT EXISTS tv_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES tv_admin_profiles(id) ON DELETE CASCADE,
    channel_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_spots INTEGER NOT NULL DEFAULT 0,
    max_seconds_per_spot INTEGER NOT NULL DEFAULT 30,
    daily_cap INTEGER, -- optional daily limit
    initial_payment DECIMAL(12,2),
    contract_file_url TEXT,
    employee_created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Special events (Ramadan, Eid, etc.) with extra fees
CREATE TABLE IF NOT EXISTS tv_special_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES tv_deals(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    extra_fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extra packages added to deals
CREATE TABLE IF NOT EXISTS tv_extra_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES tv_deals(id) ON DELETE CASCADE,
    additional_spots INTEGER NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    package_date DATE NOT NULL,
    special_event_id UUID REFERENCES tv_special_events(id), -- optional link to special event
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment tracking for deals
CREATE TABLE IF NOT EXISTS tv_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES tv_deals(id) ON DELETE CASCADE,
    payment_amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_type TEXT NOT NULL DEFAULT 'initial', -- 'initial', 'extra_package', 'special_event'
    extra_package_id UUID REFERENCES tv_extra_packages(id), -- link to extra package if applicable
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad spot planning/scheduling
CREATE TABLE IF NOT EXISTS tv_ad_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES tv_admin_profiles(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES tv_deals(id) ON DELETE CASCADE,
    category_id UUID REFERENCES tv_brand_categories(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES tv_brands(id) ON DELETE CASCADE,
    sub_brand_id UUID REFERENCES tv_sub_brands(id), -- optional
    ad_title TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    duration_seconds INTEGER NOT NULL,
    airing_count INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    failure_reason TEXT, -- reason if failed
    special_event_fee DECIMAL(12,2) DEFAULT 0, -- auto-calculated extra fee
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tv_deals_admin_id ON tv_deals(admin_id);
CREATE INDEX IF NOT EXISTS idx_tv_deals_dates ON tv_deals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tv_ad_spots_deal_id ON tv_ad_spots(deal_id);
CREATE INDEX IF NOT EXISTS idx_tv_ad_spots_date ON tv_ad_spots(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tv_ad_spots_status ON tv_ad_spots(status);
CREATE INDEX IF NOT EXISTS idx_tv_brand_categories_admin_id ON tv_brand_categories(admin_id);

-- Row Level Security (RLS) policies
ALTER TABLE tv_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_brand_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_sub_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_special_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_extra_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_ad_spots ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - can be expanded based on auth requirements)
CREATE POLICY "Users can view their own admin profile" ON tv_admin_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Admins can manage their own brand categories" ON tv_brand_categories
    FOR ALL USING (admin_id IN (SELECT id FROM tv_admin_profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage their own brands" ON tv_brands
    FOR ALL USING (category_id IN (SELECT id FROM tv_brand_categories WHERE admin_id IN (SELECT id FROM tv_admin_profiles WHERE auth.uid() = id)));

CREATE POLICY "Admins can manage their own sub-brands" ON tv_sub_brands
    FOR ALL USING (brand_id IN (SELECT id FROM tv_brands WHERE category_id IN (SELECT id FROM tv_brand_categories WHERE admin_id IN (SELECT id FROM tv_admin_profiles WHERE auth.uid() = id))));

CREATE POLICY "Admins can manage their own deals" ON tv_deals
    FOR ALL USING (admin_id IN (SELECT id FROM tv_admin_profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage special events for their deals" ON tv_special_events
    FOR ALL USING (deal_id IN (SELECT id FROM tv_deals WHERE admin_id IN (SELECT id FROM tv_admin_profiles WHERE auth.uid() = id)));

CREATE POLICY "Admins can manage extra packages for their deals" ON tv_extra_packages
    FOR ALL USING (deal_id IN (SELECT id FROM tv_deals WHERE admin_id IN (SELECT id FROM tv_admin_profiles WHERE auth.uid() = id)));

CREATE POLICY "Admins can manage payments for their deals" ON tv_payments
    FOR ALL USING (deal_id IN (SELECT id FROM tv_deals WHERE admin_id IN (SELECT id FROM tv_admin_profiles WHERE auth.uid() = id)));

CREATE POLICY "Admins can manage their own ad spots" ON tv_ad_spots
    FOR ALL USING (admin_id IN (SELECT id FROM tv_admin_profiles WHERE auth.uid() = id));
