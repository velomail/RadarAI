import { getSearchFocus } from '@/lib/search-focus';
import { isMockEngine } from './engine-mode';
import { scoreJobsMock } from './mock/score-mock';
import type { CleanJob, ScoredJobRaw } from './types';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
// One job per call, run in parallel — mirrors the n8n attach-resume design.
// Cap concurrency so we don't trip OpenAI per-minute request limits.
const CONCURRENCY = Number(process.env.OPENAI_SCORE_CONCURRENCY || 12);
const SCORE_DESCRIPTION_MAX = Number(process.env.OPENAI_SCORE_DESCRIPTION_MAX_CHARS || 2800);

const SYSTEM_PROMPT_BASE = [
  'You are a strict backend scoring engine. Evaluate the candidate resume against the single job in the user message.',
  '',
  'Rules:',
  '- Output ONLY valid JSON: a minified array with exactly ONE object.',
  '- No markdown, no code fences, no commentary.',
  '- Use the exact apply_url from the JOB section.',
  '- match_score is an integer 0-100.',
  '- fit_verdict must be HIGH, MEDIUM, or LOW.',
  '- Score for the candidate’s actual background — any industry, seniority, or function.',
  '',
  'Schema:',
  '[{"job_title":"string","company":"string","match_score":0,"fit_verdict":"HIGH|MEDIUM|LOW","resume_fit_score":0,"schedule_fit_score":0,"location_fit_score":0,"opportunity_score":0,"role_summary":"string","experience_match":"string","quality_flags":["string"],"risk_flags":["string"],"key_advantages":"string","gaps_or_objections":"string","why_promising":"string","cover_letter_hook":"string","talking_points":["string","string","string"],"apply_url":"string"}]',
  '',
  'Narrative rules (critical for the user):',
  '- role_summary: 2-3 sentences in plain English describing what the job actually is — team, product, responsibilities, employment type. No bullet lists.',
  '- experience_match: 2-4 sentences comparing the CANDIDATE resume to this role. Cite specific resume evidence (titles, skills, metrics) and map to requirements from the job description. Be honest about gaps.',
  '',
  'Application kit rules:',
  '- cover_letter_hook: 2 to 3 sentences, ready to paste into an application. Open with a concrete reason the candidate matches THIS specific role and company, reference one quantified resume win, and close with intent to contribute. No filler.',
  '- talking_points: exactly 3 short bullet strings (max ~120 chars each). Each must map a resume strength to a job requirement the description actually mentions.',
  '- If the job description is vague, still produce a usable hook + 3 points using the strongest reasonable assumptions, but flag the assumption in risk_flags.',
  '',
  'Balanced scoring rubric (100 points total):',
  '- Resume fit: 30 points. Reward direct and transferable skills, tools, certifications, titles, and quantified outcomes relevant to THIS role.',
  '- Work arrangement fit: 25 points. Reward alignment with full-time/part-time/contract/remote/hybrid/shift patterns implied by the posting AND reasonable for the candidate.',
  '- Location fit: 20 points. Reward fully remote, locally-matching cities, clearly local hybrid. Penalize distant onsite roles and impractical commutes.',
  '- Opportunity quality: 25 points. Reward growth path, training, reputable employer, compensation clarity, and career upside.',
  '',
  'Quality rules:',
  '- HIGH means strong across at least three dimensions and no severe arrangement or location risk.',
  '- MEDIUM means promising but with one meaningful uncertainty or gap.',
  '- LOW means poor arrangement/location fit, weak role alignment, or low-quality posting signals.',
  '- Penalize vague scammy postings, unpaid roles without credible upside, and postings with no company or unclear responsibilities.',
].join('\n');

function buildSystemPrompt(searchFocusId?: string): string {
  const focus = getSearchFocus(searchFocusId);
  return `${SYSTEM_PROMPT_BASE}\n\nSearch focus for this run: ${focus.label}.\n${focus.scoringContext}`;
}

function buildUserPrompt(job: CleanJob, resumeText: string): string {
  return [
    'Evaluate this ONE job against the candidate resume.',
    'Return ONLY a JSON array with exactly ONE object. No markdown fences.',
    'Use apply_url from the JOB section.',
    '',
    '--- RESUME ---',
    resumeText,
    '',
    '--- JOB ---',
    `Title: ${job.job_title}`,
    `Company: ${job.company}`,
    `Location: ${job.location || 'N/A'}`,
    `Remote: ${job.is_remote ? 'Yes' : 'No'}`,
    `Employment Type: ${job.employment_type || 'N/A'}`,
    `Apply URL: ${job.apply_url}`,
    'Description:',
    job.description_clean.length > SCORE_DESCRIPTION_MAX
      ? `${job.description_clean.slice(0, SCORE_DESCRIPTION_MAX)}…`
      : job.description_clean,
  ].join('\n');
}

function parseModelResponse(content: string, fallbackJob: CleanJob): ScoredJobRaw | null {
  const cleaned = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    const obj = Array.isArray(parsed) ? parsed[0] : parsed;
    if (!obj || typeof obj !== 'object') return null;
    return { ...obj, _clean: fallbackJob };
  } catch {
    // Try to extract the first JSON array
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[0]);
      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
      if (!obj || typeof obj !== 'object') return null;
      return { ...obj, _clean: fallbackJob };
    } catch {
      return null;
    }
  }
}

async function scoreOne(
  job: CleanJob,
  resumeText: string,
  apiKey: string,
  searchFocusId?: string,
): Promise<ScoredJobRaw | null> {
  try {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt(searchFocusId) },
          { role: 'user', content: buildUserPrompt(job, resumeText) },
        ],
      }),
    });
    if (!res.ok) {
      console.warn('openai HTTP', res.status, await res.text().catch(() => ''));
      return null;
    }
    const body = await res.json();
    const content: string = body?.choices?.[0]?.message?.content || '';
    if (!content) return null;
    return parseModelResponse(content, job);
  } catch (err) {
    console.warn('openai call failed:', (err as Error).message);
    return null;
  }
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = nextIndex++;
      if (i >= items.length) return;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function scoreWithOpenAI(
  jobs: CleanJob[],
  resumeText: string,
  searchFocusId?: string,
): Promise<ScoredJobRaw[]> {
  if (isMockEngine()) {
    console.info('[mock engine] Scoring', jobs.length, 'jobs with heuristic mock (no OpenAI)');
    return scoreJobsMock(jobs, resumeText);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY environment variable.');
  if (!resumeText || resumeText.length < 100) {
    throw new Error('Resume text too short to score (need >= 100 chars).');
  }
  if (!jobs.length) return [];

  const scored = await runWithConcurrency(jobs, CONCURRENCY, (job) =>
    scoreOne(job, resumeText, apiKey, searchFocusId),
  );
  return scored.filter((s): s is ScoredJobRaw => s !== null);
}
