
-- Drop overly permissive write policies
DROP POLICY "Authenticated users can insert affiliate URLs" ON public.affiliate_urls;
DROP POLICY "Authenticated users can update affiliate URLs" ON public.affiliate_urls;
DROP POLICY "Authenticated users can delete affiliate URLs" ON public.affiliate_urls;
