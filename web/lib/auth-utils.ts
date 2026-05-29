import { SEARCH_PAGE } from '@/lib/constants';

/** Only allow same-origin relative redirects (blocks open redirects). */
export function safeAuthRedirect(path: string | null | undefined, fallback = SEARCH_PAGE): string {
  if (!path || typeof path !== 'string') return fallback;
  if (!path.startsWith('/') || path.startsWith('//')) return fallback;
  return path;
}
