const rawBase = (import.meta.env.BASE_URL || '/') as string;
const base = rawBase.endsWith('/') ? rawBase : rawBase + '/';

export function url(path?: string | null): string {
  if (!path) return base;
  if (/^(https?:)?\/\//i.test(path)) return path;
  if (path.startsWith('mailto:') || path.startsWith('tel:')) return path;
  return base + path.replace(/^\//, '');
}
