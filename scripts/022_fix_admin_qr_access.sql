-- Fix admin access to QR codes by improving the is_admin function
-- and ensuring proper RLS policies

-- Drop and recreate the is_admin function with better caching
DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role directly without triggering RLS
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role = 'admin', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Ensure admin policies exist for QR codes
DROP POLICY IF EXISTS "Admins can view all QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins can update all QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins can delete all QR codes" ON public.qr_codes;

CREATE POLICY "Admins can view all QR codes"
  ON public.qr_codes FOR SELECT
  USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "Admins can update all QR codes"
  ON public.qr_codes FOR UPDATE
  USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "Admins can delete all QR codes"
  ON public.qr_codes FOR DELETE
  USING (public.is_admin() OR user_id = auth.uid());

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
