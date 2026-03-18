// Static fallback — Supabase affiliate_urls table takes precedence at runtime
// See src/hooks/useAffiliateUrl.ts for the dynamic version

export function getToolUrl(tool: { website: string; affiliateUrl?: string }): string {
  return tool.affiliateUrl ?? `https://${tool.website}`;
}
