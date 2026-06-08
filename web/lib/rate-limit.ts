type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function pruneBuckets() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

type HeaderLike = { get(name: string): string | null };

export function getClientIpFromRequest(h: HeaderLike): string {
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return h.get('x-real-ip') || 'unknown';
}

/**
 * Best-effort in-process rate limit. Use Vercel Firewall / Upstash for multi-instance production.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  pruneBuckets();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
