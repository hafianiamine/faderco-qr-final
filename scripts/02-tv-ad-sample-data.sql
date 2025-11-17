-- Sample data for TV Ad Scheduling System
-- This creates sample data to test the system

-- Insert sample admin profile
INSERT INTO tv_admin_profiles (id, name, email, phone, company_name) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Ahmed Hassan', 'ahmed@faderco.com', '+212-6-12-34-56-78', 'Faderco Media')
ON CONFLICT (email) DO NOTHING;

-- Insert sample brand categories
INSERT INTO tv_brand_categories (id, admin_id, name) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Food & Beverage'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Technology'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Fashion')
ON CONFLICT (id) DO NOTHING;

-- Insert sample brands
INSERT INTO tv_brands (id, category_id, name) VALUES
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Coca Cola'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Pepsi'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Samsung'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Nike')
ON CONFLICT (id) DO NOTHING;

-- Insert sample sub-brands
INSERT INTO tv_sub_brands (id, brand_id, name) VALUES
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 'Coca Cola Zero'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'Coca Cola Light'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440006', 'Galaxy Series'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440007', 'Air Jordan')
ON CONFLICT (id) DO NOTHING;

-- Insert sample TV deals
INSERT INTO tv_deals (id, admin_id, channel_name, start_date, end_date, total_spots, max_seconds_per_spot, daily_cap, initial_payment, employee_created_by) VALUES
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', '2M TV', '2025-01-01', '2025-12-31', 1000, 30, 10, 50000.00, 'Ahmed Hassan'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Al Aoula', '2025-01-01', '2025-12-31', 800, 45, 8, 40000.00, 'Ahmed Hassan'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'Medi1 TV', '2025-02-01', '2025-11-30', 600, 30, 5, 30000.00, 'Ahmed Hassan')
ON CONFLICT (id) DO NOTHING;

-- Insert sample special events
INSERT INTO tv_special_events (id, deal_id, event_name, start_date, end_date, extra_fee_amount) VALUES
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440012', 'Ramadan 2025', '2025-03-01', '2025-03-30', 500.00),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440012', 'Eid Al-Fitr', '2025-03-31', '2025-04-02', 800.00),
('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440013', 'New Year 2025', '2024-12-31', '2025-01-01', 1000.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample payments
INSERT INTO tv_payments (id, deal_id, payment_amount, payment_date, payment_type, notes) VALUES
('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440012', 50000.00, '2024-12-15', 'initial', 'Initial payment for 2M TV deal'),
('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440013', 40000.00, '2024-12-20', 'initial', 'Initial payment for Al Aoula deal'),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440014', 30000.00, '2025-01-10', 'initial', 'Initial payment for Medi1 TV deal')
ON CONFLICT (id) DO NOTHING;

-- Insert sample ad spots
INSERT INTO tv_ad_spots (id, admin_id, deal_id, category_id, brand_id, sub_brand_id, ad_title, scheduled_date, duration_seconds, airing_count, status) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440008', 'Coca Cola Zero Summer Campaign', '2025-01-15', 30, 3, 'pending'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440010', 'Samsung Galaxy S25 Launch', '2025-01-20', 45, 2, 'confirmed'),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440011', 'Air Jordan New Collection', '2025-01-25', 30, 4, 'pending')
ON CONFLICT (id) DO NOTHING;
