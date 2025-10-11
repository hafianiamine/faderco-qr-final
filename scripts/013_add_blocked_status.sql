-- Add 'blocked' status to the profiles table status check constraint
-- First, drop the existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;

-- Add the new constraint with 'blocked' status
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'blocked'));

-- Add index for blocked users
CREATE INDEX IF NOT EXISTS idx_profiles_blocked ON public.profiles(status) WHERE status = 'blocked';
