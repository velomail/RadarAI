/** Display helpers shared by job results UI (mock + live). */

const SOURCE_LABELS: Record<string, string> = {
  adzuna: 'Adzuna',
  mock: 'Sample data',
  jsearch: 'Legacy sample',
  linkedin: 'Legacy sample',
};

export function isHttpApplyUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isDemoApplyUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /example\.com|jobs\.example|\/jobs\/mock-|mock-adzuna|jsearch|rapidapi\.com|careers\.[a-z0-9-]+\.com\/jobs\/mock/i.test(
    url,
  );
}

/** Prefer the listing URL from fetch; ignore AI/mock/jsearch placeholders. */
export function resolveJobApplyUrl(
  applyUrl?: string | null,
  canonicalUrl?: string | null,
  linkedinUrl?: string | null,
  source?: string | null,
): string {
  if (source === 'mock' || source === 'jsearch') return '';

  const candidates = [applyUrl, canonicalUrl, linkedinUrl].filter(Boolean) as string[];
  for (const url of candidates) {
    if (isHttpApplyUrl(url) && !isDemoApplyUrl(url)) return url;
  }
  return '';
}

export function runUsesSampleData(sources: Record<string, number> | null | undefined): boolean {
  if (!sources) return false;
  return Object.entries(sources).some(
    ([source, count]) =>
      count > 0 &&
      (source === 'mock' || source === 'sample' || source === 'jsearch' || source === 'linkedin'),
  );
}

export function formatSourceLabel(source: string): string {
  return SOURCE_LABELS[source.toLowerCase()] ?? source;
}

/** Hide internal / demo flags from investor-facing UI. */
export function filterDisplayFlags(flags: string[] | null | undefined): string[] {
  if (!flags?.length) return [];
  return flags.filter((f) => !/mock|heuristic|fixture|internal/i.test(f));
}

export function formatSourcesBreakdown(breakdown: Record<string, number>): string {
  return Object.entries(breakdown)
    .filter(([, count]) => count > 0)
    .map(([source, count]) => `${formatSourceLabel(source)} (${count})`)
    .join(' · ');
}
