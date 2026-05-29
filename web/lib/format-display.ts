/** Display helpers shared by job results UI (mock + live). */

const SOURCE_LABELS: Record<string, string> = {
  jsearch: 'Job boards',
  linkedin: 'LinkedIn',
  mock: 'Aggregated',
};

export function formatSourceLabel(source: string): string {
  return SOURCE_LABELS[source.toLowerCase()] ?? source;
}

/** Hide internal / demo flags from investor-facing UI. */
export function filterDisplayFlags(flags: string[] | null | undefined): string[] {
  if (!flags?.length) return [];
  return flags.filter((f) => !/mock|heuristic|fixture|internal/i.test(f));
}

export function isDemoApplyUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /example\.com|jobs\.example|\/jobs\/mock-/i.test(url);
}

export function formatSourcesBreakdown(breakdown: Record<string, number>): string {
  return Object.entries(breakdown)
    .filter(([, count]) => count > 0)
    .map(([source, count]) => `${formatSourceLabel(source)} (${count})`)
    .join(' · ');
}
