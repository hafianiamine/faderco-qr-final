-- Create function to automatically create default virtual card for new users
CREATE OR REPLACE FUNCTION create_default_virtual_card()
RETURNS TRIGGER AS $$
DECLARE
  v_short_code TEXT;
  v_short_url TEXT;
BEGIN
  -- Generate unique short code
  v_short_code := SUBSTRING(md5(NEW.id::text || NOW()::text), 1, 8);
  v_short_url := 'https://' || current_setting('app.domain', true) || '/card/' || v_short_code;
  
  -- Create default virtual card
  INSERT INTO virtual_business_cards (
    user_id,
    full_name,
    email,
    short_code,
    short_url,
    theme_color,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    v_short_code,
    v_short_url,
    '#3B82F6',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_virtual_card();
