export const DEFAULT_THUMB = '/assets/img/placeholder-thumb.jpg';
export const DEFAULT_FULL  = '/assets/img/placeholder-full.jpg';

export function normalizeAssetPath(path?: string | null): string | null {
  if (!path) return null;

  // Remove zero-width & stray whitespace
  const cleaned = path
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();

  if (!cleaned) return null;

  // Ensure leading slash for absolute path resolution
  let s = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;

  // If it's an assets path with no obvious extension, assume .jpg
  if (s.startsWith('/assets/') && !/\.(jpg|jpeg|png|webp|gif)$/i.test(s)) {
    s += '.jpg';
  }
  return s;
}

export function safeHref(url?: string | null): string | null {
  if (!url) return null;
  const u = url.trim();
  // Basic allowlist; extend as needed
  if (/^(https?:)?\/\//i.test(u) || u.startsWith('/')) return u;
  return null;
}
    

