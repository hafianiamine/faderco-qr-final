-- Sample data for Faderico and Algerian TV companies
-- This script adds realistic sample data for testing the TV Ad Scheduling system

-- First, let's add a sample admin profile (using the user ID from your Supabase auth)
INSERT INTO tv_admin_profiles (id, name, email, phone, company_name, profile_image_url, created_at, updated_at)
VALUES (
  '78436c1-591d-4001-8d25-e05a64648624', -- Your actual user ID from Supabase
  'Aymen Bensalem',
  'aymen@adsight.com',
  '+213-555-123-456',
  'AdSight Media Agency',
  '/placeholder.svg?height=100&width=100',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  company_name = EXCLUDED.company_name,
  updated_at = NOW();

-- Add brand categories for Algerian market
INSERT INTO tv_brand_categories (id, admin_id, name, created_at, updated_at) VALUES
  (gen_random_uuid(), '78436c1-591d-4001-8d25-e05a64648624', 'Telecommunications', NOW(), NOW()),
  (gen_random_uuid(), '78436c1-591d-4001-8d25-e05a64648624', 'Food & Beverages', NOW(), NOW()),
  (gen_random_uuid(), '78436c1-591d-4001-8d25-e05a64648624', 'Automotive', NOW(), NOW()),
  (gen_random_uuid(), '78436c1-591d-4001-8d25-e05a64648624', 'Banking & Finance', NOW(), NOW()),
  (gen_random_uuid(), '78436c1-591d-4001-8d25-e05a64648624', 'Retail & Fashion', NOW(), NOW());

-- Get category IDs for brands
WITH categories AS (
  SELECT id, name FROM tv_brand_categories WHERE admin_id = '78436c1-591d-4001-8d25-e05a64648624'
)

-- Add major Algerian and international brands
INSERT INTO tv_brands (id, category_id, name, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  c.id,
  brand_name,
  NOW(),
  NOW()
FROM categories c
CROSS JOIN (
  VALUES 
    ('Telecommunications', 'Djezzy'),
    ('Telecommunications', 'Ooredoo Algeria'),
    ('Telecommunications', 'Mobilis'),
    ('Food & Beverages', 'Cevital'),
    ('Food & Beverages', 'Danone Algeria'),
    ('Food & Beverages', 'Coca-Cola Algeria'),
    ('Food & Beverages', 'Ifri'),
    ('Automotive', 'Renault Algeria'),
    ('Automotive', 'Peugeot Algeria'),
    ('Automotive', 'Hyundai Algeria'),
    ('Banking & Finance', 'BNA'),
    ('Banking & Finance', 'CPA Bank'),
    ('Banking & Finance', 'AGB Bank'),
    ('Retail & Fashion', 'Uno'),
    ('Retail & Fashion', 'Ardis')
) AS brands(category_name, brand_name)
WHERE c.name = brands.category_name;

-- Add sub-brands for major brands
WITH brands AS (
  SELECT b.id, b.name, c.name as category_name 
  FROM tv_brands b 
  JOIN tv_brand_categories c ON b.category_id = c.id 
  WHERE c.admin_id = '78436c1-591d-4001-8d25-e05a64648624'
)
INSERT INTO tv_sub_brands (id, brand_id, name, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  b.id,
  sub_brand_name,
  NOW(),
  NOW()
FROM brands b
CROSS JOIN (
  VALUES 
    ('Djezzy', 'Djezzy 4G'),
    ('Djezzy', 'Djezzy Prepaid'),
    ('Djezzy', 'Djezzy Postpaid'),
    ('Ooredoo Algeria', 'Ooredoo 4G+'),
    ('Ooredoo Algeria', 'Ooredoo Business'),
    ('Mobilis', 'Mobilis 4G'),
    ('Mobilis', 'Mobilis Internet'),
    ('Cevital', 'Cevital Agro'),
    ('Cevital', 'Cevital Food'),
    ('Danone Algeria', 'Danone Yogurt'),
    ('Danone Algeria', 'Danone Water'),
    ('Coca-Cola Algeria', 'Coca-Cola Classic'),
    ('Coca-Cola Algeria', 'Fanta Algeria'),
    ('Ifri', 'Ifri Water'),
    ('Ifri', 'Ifri Juice'),
    ('Renault Algeria', 'Renault Clio'),
    ('Renault Algeria', 'Renault Duster'),
    ('BNA', 'BNA Personal'),
    ('BNA', 'BNA Business'),
    ('Uno', 'Uno Fashion'),
    ('Uno', 'Uno Home')
) AS sub_brands(brand_name, sub_brand_name)
WHERE b.name = sub_brands.brand_name;

-- Add TV deals for major Algerian channels
INSERT INTO tv_deals (id, admin_id, channel_name, start_date, end_date, total_spots, max_seconds_per_spot, daily_cap, initial_payment, employee_created_by, created_at, updated_at) VALUES
  (gen_random_uuid(), '78436c1-591d-4001-8d25-e05a64648624', 'ENTV (Canal Algérie)', '2024-01-01', '2024-12-31', 1000, 30, 50, 250000.00, 'Aymen Bensalem', NOW(), NOW()),
  (gen_random_uuid(), '78436c1-591d-4001-8d25-e05a64648624', 'Echorouk TV', '2024-01-01', '2024-12-31', 800, 30, 40, 200000.00, 'Aymen Bensalem', NOW(), NOW()),
  (gen_random_uuid(), '78436c1-591d-4001-8d25-e05a64648624', 'Ennahar TV', '2024-01-01', '2024-12-31', 600, 30, 35, 150000.00, 'Aymen Bensalem', NOW(), NOW()),
  (gen_random_uuid(), '78436c1-591d-4001-8d25-e05a64648624', 'El Bilad TV', '2024-01-01', '2024-12-31', 500, 30, 30, 125000.00, 'Aymen Bensalem', NOW(), NOW()),
  (gen_random_uuid(), '78436c1-591d-4001-8d25-e05a64648624', 'Al Magharibia', '2024-01-01', '2024-12-31', 400, 30, 25, 100000.00, 'Aymen Bensalem', NOW(), NOW());

-- Add special events (Ramadan, Eid, etc.)
WITH deals AS (
  SELECT id FROM tv_deals WHERE admin_id = '78436c1-591d-4001-8d25-e05a64648624'
)
INSERT INTO tv_special_events (id, deal_id, event_name, start_date, end_date, extra_fee_amount, created_at)
SELECT 
  gen_random_uuid(),
  d.id,
  event_name,
  start_date::date,
  end_date::date,
  extra_fee,
  NOW()
FROM deals d
CROSS JOIN (
  VALUES 
    ('Ramadan 2024', '2024-03-10', '2024-04-09', 50.00),
    ('Eid Al-Fitr 2024', '2024-04-10', '2024-04-12', 75.00),
    ('Eid Al-Adha 2024', '2024-06-16', '2024-06-19', 75.00),
    ('Independence Day', '2024-07-05', '2024-07-05', 100.00),
    ('New Year 2025', '2024-12-31', '2025-01-01', 100.00)
) AS events(event_name, start_date, end_date, extra_fee);

-- Add some sample ad spots
WITH 
deals AS (SELECT id, channel_name FROM tv_deals WHERE admin_id = '78436c1-591d-4001-8d25-e05a64648624'),
categories AS (SELECT id, name FROM tv_brand_categories WHERE admin_id = '78436c1-591d-4001-8d25-e05a64648624'),
brands AS (SELECT b.id, b.name, b.category_id FROM tv_brands b JOIN tv_brand_categories c ON b.category_id = c.id WHERE c.admin_id = '78436c1-591d-4001-8d25-e05a64648624'),
sub_brands AS (SELECT sb.id, sb.name, sb.brand_id FROM tv_sub_brands sb JOIN tv_brands b ON sb.brand_id = b.id JOIN tv_brand_categories c ON b.category_id = c.id WHERE c.admin_id = '78436c1-591d-4001-8d25-e05a64648624')

INSERT INTO tv_ad_spots (id, admin_id, deal_id, category_id, brand_id, sub_brand_id, ad_title, scheduled_date, duration_seconds, airing_count, status, special_event_fee, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  '78436c1-591d-4001-8d25-e05a64648624',
  d.id,
  b.category_id,
  b.id,
  sb.id,
  ad_title,
  scheduled_date::date,
  duration,
  airing_count,
  status,
  0.00,
  NOW(),
  NOW()
FROM deals d
CROSS JOIN brands b
CROSS JOIN sub_brands sb
CROSS JOIN (
  VALUES 
    ('Djezzy 4G Network Launch', '2024-09-15', 30, 3, 'confirmed'),
    ('Ooredoo Ramadan Campaign', '2024-03-15', 30, 5, 'confirmed'),
    ('Cevital New Product Launch', '2024-10-01', 30, 2, 'pending'),
    ('BNA Banking Services', '2024-09-20', 30, 4, 'confirmed'),
    ('Renault Duster Promotion', '2024-11-01', 30, 2, 'pending')
) AS ads(ad_title, scheduled_date, duration, airing_count, status)
WHERE sb.brand_id = b.id
AND (
  (ads.ad_title LIKE '%Djezzy%' AND b.name = 'Djezzy' AND sb.name = 'Djezzy 4G') OR
  (ads.ad_title LIKE '%Ooredoo%' AND b.name = 'Ooredoo Algeria' AND sb.name = 'Ooredoo 4G+') OR
  (ads.ad_title LIKE '%Cevital%' AND b.name = 'Cevital' AND sb.name = 'Cevital Food') OR
  (ads.ad_title LIKE '%BNA%' AND b.name = 'BNA' AND sb.name = 'BNA Personal') OR
  (ads.ad_title LIKE '%Renault%' AND b.name = 'Renault Algeria' AND sb.name = 'Renault Duster')
)
LIMIT 20;

-- Add some payments
WITH deals AS (
  SELECT id FROM tv_deals WHERE admin_id = '78436c1-591d-4001-8d25-e05a64648624'
)
INSERT INTO tv_payments (id, deal_id, payment_amount, payment_date, payment_type, notes, created_at)
SELECT 
  gen_random_uuid(),
  d.id,
  payment_amount,
  payment_date::date,
  payment_type,
  notes,
  NOW()
FROM deals d
CROSS JOIN (
  VALUES 
    (250000.00, '2024-01-01', 'initial', 'Initial contract payment for ENTV'),
    (200000.00, '2024-01-01', 'initial', 'Initial contract payment for Echorouk TV'),
    (50000.00, '2024-03-01', 'extra_package', 'Additional spots for Ramadan campaign'),
    (75000.00, '2024-06-01', 'extra_package', 'Summer campaign additional spots')
) AS payments(payment_amount, payment_date, payment_type, notes)
LIMIT 10;
