/** Shared rate-limit helpers for RapidAPI (JSearch + LinkedIn). */

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function capUniqueQueries(queries: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const q of queries) {
    const t = q.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

/** Widen queries that are not already in the primary set. */
export function widenExtras(primary: string[], widen: string[], max: number): string[] {
  const primaryKeys = new Set(primary.map((q) => q.toLowerCase()));
  return capUniqueQueries(
    widen.filter((q) => !primaryKeys.has(q.toLowerCase())),
    max,
  );
}

export function isRateLimitMessage(message: string | undefined): boolean {
  return !!message && (message.includes('429') || /rate limit/i.test(message));
}

export async function withRateLimitRetry<T extends { ok: boolean; message?: string }>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const maxRetries = Number(process.env.RAPIDAPI_MAX_RETRIES || 3);
  const baseDelayMs = Number(process.env.RAPIDAPI_RETRY_BASE_MS || 2500);
  let last: T | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    last = await fn();
    if (last.ok || !isRateLimitMessage(last.message)) return last;
    if (attempt < maxRetries) {
      const wait = baseDelayMs * 2 ** attempt;
      console.warn(`RapidAPI 429 (${label}) — retry ${attempt + 1}/${maxRetries} in ${wait}ms`);
      await sleep(wait);
    }
  }

  return last!;
}

export async function runSerial<T>(
  tasks: Array<() => Promise<T>>,
  delayMs: number,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i++) {
    if (i > 0 && delayMs > 0) await sleep(delayMs);
    results.push(await tasks[i]());
  }
  return results;
}
