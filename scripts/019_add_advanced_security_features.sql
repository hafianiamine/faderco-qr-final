-- Add login history tracking for security alerts
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add pending deletions table for 12-hour delete delay
CREATE TABLE IF NOT EXISTS public.pending_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deletion_reason TEXT,
  password_confirmed BOOLEAN DEFAULT FALSE,
  scheduled_deletion_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(qr_code_id)
);

-- Add welcome popup settings to settings table
INSERT INTO public.settings (key, value) 
VALUES 
  ('welcome_popup_enabled', 'true'),
  ('welcome_popup_title', 'Welcome to Our New Brand Tool'),
  ('welcome_popup_description', 'Experience the power of FADERCO QR tracking with advanced analytics and customization options.')
ON CONFLICT (key) DO NOTHING;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_logged_in_at ON public.login_history(logged_in_at);
CREATE INDEX IF NOT EXISTS idx_pending_deletions_qr_code_id ON public.pending_deletions(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_pending_deletions_scheduled_deletion_at ON public.pending_deletions(scheduled_deletion_at);

-- Enable RLS
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_deletions ENABLE ROW LEVEL SECURITY;

-- Login history policies
CREATE POLICY "Users can view their own login history"
  ON public.login_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert login history"
  ON public.login_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all login history"
  ON public.login_history FOR SELECT
  USING (public.is_admin());

-- Pending deletions policies
CREATE POLICY "Users can view their own pending deletions"
  ON public.pending_deletions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pending deletions"
  ON public.pending_deletions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pending deletions"
  ON public.pending_deletions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pending deletions"
  ON public.pending_deletions FOR SELECT
  USING (public.is_admin());
