-- Add landing page content settings
-- This allows admins to control the text on the landing page

insert into public.settings (key, value)
values 
  ('landing_hook_words', 'UPDATE,SCHEDULE,CHANGE,WATCH'),
  ('landing_hook_text', 'your QR anytime — even after printing.'),
  ('landing_hook_subtitle', 'No more "oops, it''s already printed on 1000 packaging".'),
  ('landing_badge_text', 'Next-Gen QR Platform'),
  ('landing_feature_1_title', 'Real-time Analytics'),
  ('landing_feature_1_desc', 'Track every scan instantly'),
  ('landing_feature_2_title', 'Live Map View'),
  ('landing_feature_2_desc', 'See where scans happen'),
  ('landing_feature_3_title', 'URL Shortener'),
  ('landing_feature_3_desc', 'Built-in short links'),
  ('landing_feature_4_title', 'Who, When, Where'),
  ('landing_feature_4_desc', 'Complete scan details')
on conflict (key) do nothing;
