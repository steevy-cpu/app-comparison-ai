import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useAffiliateUrl(toolSlug: string, fallbackUrl: string): string {
  const [url, setUrl] = useState(fallbackUrl)

  useEffect(() => {
    supabase
      .from('affiliate_urls')
      .select('affiliate_url')
      .eq('tool_slug', toolSlug)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.affiliate_url) setUrl(data.affiliate_url)
      })
  }, [toolSlug, fallbackUrl])

  return url
}
