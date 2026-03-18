export function getToolUrl(tool: { website: string; affiliateUrl?: string }): string {
  return tool.affiliateUrl ?? `https://${tool.website}`;
}
