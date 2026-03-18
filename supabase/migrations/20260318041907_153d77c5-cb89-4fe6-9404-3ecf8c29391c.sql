
-- Create affiliate_urls table
CREATE TABLE public.affiliate_urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_slug TEXT NOT NULL UNIQUE,
  tool_name TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_urls ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read affiliate URLs"
  ON public.affiliate_urls
  FOR SELECT
  USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert affiliate URLs"
  ON public.affiliate_urls
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update affiliate URLs"
  ON public.affiliate_urls
  FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete affiliate URLs"
  ON public.affiliate_urls
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_affiliate_urls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_affiliate_urls_updated_at
  BEFORE UPDATE ON public.affiliate_urls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_affiliate_urls_updated_at();
