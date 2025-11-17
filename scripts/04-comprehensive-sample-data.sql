-- Comprehensive sample data for TV Ad Scheduling System
-- This includes Faderico and Algerian TV companies with realistic data

-- First, ensure we have an admin profile for the authenticated user
INSERT INTO tv_admin_profiles (id, name, email, phone, company_name, profile_image_url) 
VALUES (
  '78436fc1-591d-4001-8d25-e05464448624'::uuid,
  'Aymen Bensalem',
  'aymen@adsight.com',
  '+213 555 123 456',
  'Faderico Media Agency',
  '/placeholder.svg?height=100&width=100'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  company_name = EXCLUDED.company_name,
  profile_image_url = EXCLUDED.profile_image_url;

-- Brand Categories (Algerian market focus)
INSERT INTO tv_brand_categories (id, admin_id, name) VALUES
  (gen_random_uuid(), '78436fc1-591d-4001-8d25-e05464448624'::uuid, 'Telecommunications'),
  (gen_random_uuid(), '78436fc1-591d-4001-8d25-e05464448624'::uuid, 'Banking & Finance'),
  (gen_random_uuid(), '78436fc1-591d-4001-8d25-e05464448624'::uuid, 'Food & Beverage'),
  (gen_random_uuid(), '78436fc1-591d-4001-8d25-e05464448624'::uuid, 'Automotive'),
  (gen_random_uuid(), '78436fc1-591d-4001-8d25-e05464448624'::uuid, 'Retail & Shopping');

-- Get category IDs for reference
WITH categories AS (
  SELECT id, name FROM tv_brand_categories WHERE admin_id = '78436fc1-591d-4001-8d25-e05464448624'::uuid
)

-- Brands (Major Algerian companies)
INSERT INTO tv_brands (id, category_id, name)
SELECT 
  gen_random_uuid(),
  c.id,
  brand_name
FROM categories c
CROSS JOIN (
  VALUES 
    ('Telecommunications', 'Djezzy'),
    ('Telecommunications', 'Ooredoo Algeria'),
    ('Telecommunications', 'Mobilis'),
    ('Banking & Finance', 'BNA Bank'),
    ('Banking & Finance', 'CPA Bank'),
    ('Banking & Finance', 'BEA Bank'),
    ('Food & Beverage', 'Cevital'),
    ('Food & Beverage', 'Danone Algeria'),
    ('Food & Beverage', 'Coca-Cola Algeria'),
    ('Automotive', 'Renault Algeria'),
    ('Automotive', 'Peugeot Algeria'),
    ('Retail & Shopping', 'Uno Shopping'),
    ('Retail & Shopping', 'Carrefour Algeria')
) AS brands(category_name, brand_name)
WHERE c.name = brands.category_name;

-- Sub-brands
WITH brands_data AS (
  SELECT b.id as brand_id, b.name as brand_name
  FROM tv_brands b
  JOIN tv_brand_categories c ON b.category_id = c.id
  WHERE c.admin_id = '78436fc1-591d-4001-8d25-e05464448624'::uuid
)
INSERT INTO tv_sub_brands (id, brand_id, name)
SELECT 
  gen_random_uuid(),
  bd.brand_id,
  sub_brand_name
FROM brands_data bd
CROSS JOIN (
  VALUES 
    ('Djezzy', 'Djezzy Prepaid'),
    ('Djezzy', 'Djezzy Postpaid'),
    ('Djezzy', 'Djezzy Business'),
    ('Ooredoo Algeria', 'Ooredoo Mobile'),
    ('Ooredoo Algeria', 'Ooredoo Internet'),
    ('Ooredoo Algeria', 'Ooredoo Business'),
    ('Mobilis', 'Mobilis 3G'),
    ('Mobilis', 'Mobilis 4G'),
    ('BNA Bank', 'BNA Personal'),
    ('BNA Bank', 'BNA Business'),
    ('CPA Bank', 'CPA Savings'),
    ('CPA Bank', 'CPA Loans'),
    ('Cevital', 'Cevital Oil'),
    ('Cevital', 'Cevital Sugar'),
    ('Cevital', 'Cevital Margarine'),
    ('Renault Algeria', 'Renault Clio'),
    ('Renault Algeria', 'Renault Duster'),
    ('Uno Shopping', 'Uno Fashion'),
    ('Uno Shopping', 'Uno Electronics')
) AS sub_brands(parent_brand, sub_brand_name)
WHERE bd.brand_name = sub_brands.parent_brand;

-- TV Deals (Algerian TV channels)
INSERT INTO tv_deals (id, admin_id, channel_name, start_date, end_date, total_spots, daily_cap, max_seconds_per_spot, initial_payment, employee_created_by, contract_file_url)
VALUES
  (gen_random_uuid(), '78436fc1-591d-4001-8d25-e05464448624'::uuid, 'Echorouk TV', '2024-01-01', '2024-12-31', 500, 10, 30, 150000.00, 'Aymen Bensalem', '/contracts/echorouk-2024.pdf'),
  (gen_random_uuid(), '78436fc1-591d-4001-8d25-e05464448624'::uuid, 'Ennahar TV', '2024-02-01', '2024-12-31', 400, 8, 30, 120000.00, 'Aymen Bensalem', '/contracts/ennahar-2024.pdf'),
  (gen_random_uuid(), '78436fc1-591d-4001-8d25-e05464448624'::uuid, 'El Bilad TV', '2024-03-01', '2024-12-31', 300, 6, 30, 90000.00, 'Aymen Bensalem', '/contracts/bilad-2024.pdf'),
  (gen_random_uuid(), '78436fc1-591d-4001-8d25-e05464448624'::uuid, 'Algeria TV', '2024-01-15', '2024-12-31', 600, 12, 45, 200000.00, 'Aymen Bensalem', '/contracts/algeria-tv-2024.pdf'),
  (gen_random_uuid(), '78436fc1-591d-4001-8d25-e05464448624'::uuid, 'Canal Algerie', '2024-04-01', '2024-12-31', 250, 5, 30, 75000.00, 'Aymen Bensalem', '/contracts/canal-algerie-2024.pdf');

-- Special Events (Ramadan, Eid, etc.)
WITH deals_data AS (
  SELECT id as deal_id, channel_name FROM tv_deals WHERE admin_id = '78436fc1-591d-4001-8d25-e05464448624'::uuid
)
INSERT INTO tv_special_events (id, deal_id, event_name, start_date, end_date, extra_fee_amount)
SELECT 
  gen_random_uuid(),
  dd.deal_id,
  'Ramadan 2024',
  '2024-03-10',
  '2024-04-09',
  5000.00
FROM deals_data dd
WHERE dd.channel_name IN ('Echorouk TV', 'Ennahar TV', 'Algeria TV');

-- Extra Packages
WITH deals_data AS (
  SELECT d.id as deal_id, se.id as special_event_id
  FROM tv_deals d
  JOIN tv_special_events se ON d.id = se.deal_id
  WHERE d.admin_id = '78436fc1-591d-4001-8d25-e05464448624'::uuid
  LIMIT 2
)
INSERT INTO tv_extra_packages (id, deal_id, special_event_id, additional_spots, amount_paid, package_date)
SELECT 
  gen_random_uuid(),
  dd.deal_id,
  dd.special_event_id,
  50,
  25000.00,
  '2024-03-15'
FROM deals_data dd;

-- Payments
WITH deals_data AS (
  SELECT id as deal_id FROM tv_deals WHERE admin_id = '78436fc1-591d-4001-8d25-e05464448624'::uuid
)
INSERT INTO tv_payments (id, deal_id, payment_type, payment_amount, payment_date, notes)
SELECT 
  gen_random_uuid(),
  dd.deal_id,
  'Initial Payment',
  CASE 
    WHEN random() < 0.5 THEN 50000.00
    ELSE 75000.00
  END,
  CURRENT_DATE - INTERVAL '30 days',
  'Initial contract payment'
FROM deals_data dd;

-- Ad Spots (Sample scheduled ads)
WITH spots_data AS (
  SELECT 
    d.id as deal_id,
    d.admin_id,
    c.id as category_id,
    b.id as brand_id,
    sb.id as sub_brand_id,
    b.name as brand_name,
    sb.name as sub_brand_name
  FROM tv_deals d
  CROSS JOIN tv_brand_categories c
  JOIN tv_brands b ON c.id = b.category_id
  JOIN tv_sub_brands sb ON b.id = sb.brand_id
  WHERE d.admin_id = '78436fc1-591d-4001-8d25-e05464448624'::uuid
    AND c.admin_id = '78436fc1-591d-4001-8d25-e05464448624'::uuid
  LIMIT 20
)
INSERT INTO tv_ad_spots (id, admin_id, deal_id, category_id, brand_id, sub_brand_id, ad_title, scheduled_date, duration_seconds, airing_count, status, special_event_fee)
SELECT 
  gen_random_uuid(),
  sd.admin_id,
  sd.deal_id,
  sd.category_id,
  sd.brand_id,
  sd.sub_brand_id,
  sd.brand_name || ' - ' || sd.sub_brand_name || ' Campaign',
  CURRENT_DATE + INTERVAL '1 day' * (random() * 30)::int,
  (15 + random() * 15)::int, -- 15-30 seconds
  (1 + random() * 3)::int, -- 1-4 airings
  CASE 
    WHEN random() < 0.7 THEN 'confirmed'
    WHEN random() < 0.9 THEN 'pending'
    ELSE 'failed'
  END,
  CASE WHEN random() < 0.3 THEN 1000.00 ELSE 0.00 END
FROM spots_data sd;

-- Update some spots to have failure reasons
UPDATE tv_ad_spots 
SET failure_reason = 'Technical issue during broadcast'
WHERE status = 'failed';

COMMIT;
