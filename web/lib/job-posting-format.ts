export interface PostingSection {
  title: string;
  body: string;
}

const KNOWN_SECTION_TITLES = [
  'job description',
  'about the role',
  'about the position',
  'about the job',
  'about us',
  'about the company',
  'company description',
  'role overview',
  'position overview',
  'overview',
  'responsibilities',
  'key responsibilities',
  'what you will do',
  "what you'll do",
  'requirements',
  'qualifications',
  'required qualifications',
  'minimum qualifications',
  'preferred qualifications',
  'skills',
  'required skills',
  'benefits',
  'what we offer',
  'compensation',
  'schedule',
  'work arrangement',
];

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/** Strip duplicate scraped headers (e.g. "Job Description Job Description"). */
export function stripPostingBoilerplate(text: string): string {
  let t = normalizeWhitespace(text);
  for (let i = 0; i < 3; i++) {
    const next = t.replace(/^(job description|overview|description)\s*[:\-]?\s*/i, '').trim();
    if (next === t) break;
    t = next;
  }
  return t;
}

function isSectionHeader(line: string): string | null {
  const trimmed = line.trim().replace(/[:\-–—]\s*$/, '').trim();
  if (!trimmed || trimmed.length > 60) return null;
  const lower = trimmed.toLowerCase();
  if (KNOWN_SECTION_TITLES.includes(lower)) {
    return trimmed.replace(/[:\-–—]\s*$/, '');
  }
  if (/^[A-Z][A-Z\s/&]{2,50}$/.test(trimmed)) {
    return trimmed
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  if (/^(responsibilities|requirements|qualifications|benefits|skills|about)\b/i.test(trimmed)) {
    return trimmed.replace(/[:\-–—]\s*$/, '');
  }
  return null;
}

/** Split a raw listing into Indeed/LinkedIn-style sections for display. */
export function formatJobPostingSections(raw: string | null | undefined): PostingSection[] {
  if (!raw?.trim()) return [];

  const cleaned = stripPostingBoilerplate(raw);
  const lines = cleaned.split('\n');
  const sections: PostingSection[] = [];
  let currentTitle = 'Overview';
  let currentLines: string[] = [];

  function flush() {
    const body = normalizeWhitespace(currentLines.join('\n'));
    if (!body) return;
    const last = sections[sections.length - 1];
    if (last && last.title === currentTitle) {
      last.body = `${last.body}\n\n${body}`;
    } else {
      sections.push({ title: currentTitle, body });
    }
    currentLines = [];
  }

  for (const line of lines) {
    const header = isSectionHeader(line);
    if (header && (currentLines.length > 0 || sections.length > 0)) {
      flush();
      currentTitle = header;
      continue;
    }
    if (header && currentLines.length === 0 && sections.length === 0) {
      currentTitle = header;
      continue;
    }
    currentLines.push(line);
  }
  flush();

  if (sections.length === 0 && cleaned) {
    return [{ title: 'Overview', body: cleaned }];
  }

  return sections;
}

/** Turn AI bullet strings (newlines, •, -, ;) into a list for rendering. */
export function parseNarrativeBullets(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  const parts = text
    .split(/\n|•|(?:\s*;\s+)/)
    .map((s) => s.replace(/^[\s\-–*]+/, '').trim())
    .filter(Boolean);
  if (parts.length > 1) return parts;
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  return sentences.length > 1 ? sentences : [text.trim()];
}
