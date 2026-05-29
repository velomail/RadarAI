import { isMockEngine } from '@/lib/engine/engine-mode';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Derive 4 job-title search phrases from resume text (used when focus = auto).
 */
export async function inferQueriesFromResume(resumeText: string): Promise<string[]> {
  if (isMockEngine()) {
    return fallbackFromResume(resumeText);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return ['specialist', 'coordinator', 'associate', 'analyst'];
  }

  const excerpt = resumeText.slice(0, 6000);

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
          {
            role: 'system',
            content:
              'You extract job search keywords from resumes. Output ONLY JSON: {"queries":["string","string","string","string"]}. Each query should be a realistic job title or role phrase (2-5 words) the candidate could apply to today. Use their seniority and domain. No markdown.',
          },
          {
            role: 'user',
            content: `Resume:\n${excerpt}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      console.warn('inferQueriesFromResume HTTP', res.status);
      return fallbackFromResume(resumeText);
    }

    const body = await res.json();
    const content: string = body?.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(content) as { queries?: unknown };
    const queries = Array.isArray(parsed.queries)
      ? parsed.queries.map(String).map((q) => q.trim()).filter(Boolean).slice(0, 4)
      : [];
    return queries.length ? queries : fallbackFromResume(resumeText);
  } catch (err) {
    console.warn('inferQueriesFromResume failed:', (err as Error).message);
    return fallbackFromResume(resumeText);
  }
}

function fallbackFromResume(resumeText: string): string[] {
  const lines = resumeText.split('\n').map((l) => l.trim()).filter(Boolean);
  const titleLine = lines.find((l) => l.length > 3 && l.length < 80 && !/@/.test(l));
  if (titleLine) {
    return [titleLine, 'specialist', 'coordinator', 'associate'];
  }
  return ['specialist', 'coordinator', 'associate', 'analyst'];
}
