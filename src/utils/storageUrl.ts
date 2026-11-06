// Convex's self-hosted storage URLs (from ctx.storage.getUrl / generateUploadUrl)
// can come back relative to the Convex deployment rather than absolute, which
// otherwise resolves against this app's own origin and 404s.
export function resolveStorageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}${url}`;
}
