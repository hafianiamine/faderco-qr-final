-- Drop all existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins can view all scans" ON public.scans;

-- Create a function to check if user is admin (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate admin policies using the function (no more recursion!)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can view all QR codes"
  ON public.qr_codes FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all scans"
  ON public.scans FOR SELECT
  USING (public.is_admin());

-- Also add insert policy for profiles (needed for auto-setup)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
