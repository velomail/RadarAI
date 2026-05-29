/** Only allow same-origin relative redirects (blocks open redirects). */
export function safeAuthRedirect(path: string | null | undefined, fallback = '/dashboard'): string {
  if (!path || typeof path !== 'string') return fallback;
  if (!path.startsWith('/') || path.startsWith('//')) return fallback;
  return path;
}
