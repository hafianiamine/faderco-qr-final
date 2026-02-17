-- Create landing_sections table
CREATE TABLE IF NOT EXISTS public.landing_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read landing sections" ON public.landing_sections;
DROP POLICY IF EXISTS "Admins can update landing sections" ON public.landing_sections;

-- Create read policy for public access
CREATE POLICY "Anyone can read landing sections" ON public.landing_sections
  FOR SELECT USING (true);

-- Create update policy for admins only
CREATE POLICY "Admins can update landing sections" ON public.landing_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert default sections
INSERT INTO public.landing_sections (section_number, title, description, youtube_url)
VALUES
  (1, 'Reusable NFC Cards for a Zero-Paper Experience', 'Replace paper business cards and disposable gift cards with modern NFC cards — tap, share, and reuse endlessly.', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  (2, 'Smart Company ID Cards Always Up to Date', 'Create employee ID cards that can be updated instantly without reprinting — perfect for modern, secure, sustainable workplaces.', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  (3, 'QR Codes That Eliminate Reprints', 'Update your QR content anytime, reduce printing mistakes, and cut operational costs with a smarter, reusable QR system.', 'https://www.youtube.com/embed/dQw4w9WgXcQ')
ON CONFLICT (section_number) DO NOTHING;
