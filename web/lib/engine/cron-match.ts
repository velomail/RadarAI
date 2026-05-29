/**
 * Minimal cron expression matcher.
 * Supports `MIN HOUR DAY MONTH WEEKDAY` with `*`, comma lists, ranges,
 * and step `*\/N` syntax. Good enough for v1 schedules
 * (e.g. `0 7,12,17 * * *`). Returns false on anything else.
 */
function parseField(field: string, min: number, max: number): Set<number> {
  const set = new Set<number>();
  if (field === '*') {
    for (let i = min; i <= max; i++) set.add(i);
    return set;
  }
  for (const part of field.split(',')) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = Number(stepStr) || 1;
      let a: number;
      let b: number;
      if (range === '*') {
        a = min;
        b = max;
      } else if (range.includes('-')) {
        const [aa, bb] = range.split('-').map(Number);
        a = aa;
        b = bb;
      } else {
        a = Number(range);
        b = max;
      }
      for (let i = a; i <= b; i += step) set.add(i);
    } else if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      for (let i = a; i <= b; i++) set.add(i);
    } else {
      const n = Number(part);
      if (!Number.isNaN(n)) set.add(n);
    }
  }
  return set;
}

export function cronMatches(cronExpr: string, hour: number, minute: number): boolean {
  if (!cronExpr) return false;
  const fields = String(cronExpr).trim().split(/\s+/);
  if (fields.length < 5) return false;
  const [m, h] = fields;
  return parseField(m, 0, 59).has(minute) && parseField(h, 0, 23).has(hour);
}

/**
 * Vercel Cron on Hobby fires once per day with ±59min precision, so we
 * widen the match to "did this cron fire any time in the last hour" rather
 * than requiring an exact minute match. Anyone whose schedule asked for
 * something inside the window gets a run.
 */
export function cronMatchedInWindow(
  cronExpr: string,
  windowEndHour: number,
  windowEndMinute: number,
  windowMinutes: number = 75,
): boolean {
  if (!cronExpr) return false;
  const endMin = windowEndHour * 60 + windowEndMinute;
  for (let offset = 0; offset < windowMinutes; offset++) {
    const t = (endMin - offset + 24 * 60) % (24 * 60);
    const h = Math.floor(t / 60);
    const m = t % 60;
    if (cronMatches(cronExpr, h, m)) return true;
  }
  return false;
}

export function nowInTimezone(tz: string): { hour: number; minute: number } {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = dtf.formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour')?.value || '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value || '0');
  return { hour, minute };
}
