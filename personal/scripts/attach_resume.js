/**
 * Attach resume text + OpenAI user prompt to each cleaned job item.
 * n8n Code node: JavaScript, "Run Once for All Items"
 * Place AFTER "Clean Jobs", BEFORE "Message a model".
 * Requires a node named exactly: Extract from File
 */

// === N8N COPY START ===

const RESUME_NODE = 'Extract from File';

function getResumeText() {
  let item;
  try {
    item = $(RESUME_NODE).first();
  } catch (e) {
    throw new Error(
      `Could not read "${RESUME_NODE}". Rename your PDF extract node to match, or fix RESUME_NODE in this script.`,
    );
  }

  const j = item?.json ?? {};
  const text =
    j.text ||
    j.data ||
    (typeof j.content === 'string' ? j.content : '') ||
    '';

  if (!text || String(text).trim().length < 100) {
    throw new Error(
      `"${RESUME_NODE}" has no usable resume text. Check PDF path and extract operation.`,
    );
  }

  return String(text).trim();
}

const resumeText = getResumeText();
const jobs = $input.all();

if (!jobs.length) {
  throw new Error(
    'No job items received. Run Fetch All Sources → Load Seen Jobs → Clean Jobs before this node.',
  );
}

const skipped = [];

const out = jobs
  .map((item) => {
    const job = item.json ?? {};

    if (job.status === 'no_jobs_found') {
      skipped.push(job.message || 'no_jobs_found');
      return null;
    }

    if (!job.job_title || !job.description_clean) {
      skipped.push(job.job_title || 'unknown');
      return null;
    }

    const ai_user_prompt = [
      'Evaluate this ONE job against the candidate resume.',
      'Return ONLY a JSON array with exactly ONE object. No markdown fences.',
      'Use apply_url from the JOB section (not a shortened field).',
      '',
      '--- RESUME ---',
      resumeText,
      '',
      '--- JOB ---',
      `Title: ${job.job_title}`,
      `Company: ${job.company}`,
      `Location: ${job.location || 'N/A'}`,
      `Remote: ${job.is_remote ? 'Yes' : 'No'}`,
      `Apply URL: ${job.apply_url}`,
      `Description:`,
      job.description_clean,
      '',
      '--- REQUIRED JSON SHAPE ---',
      '[{"job_title":"string","company":"string","match_score":0-100,"fit_verdict":"HIGH|MEDIUM|LOW","resume_fit_score":0-30,"schedule_fit_score":0-25,"location_fit_score":0-20,"opportunity_score":0-25,"quality_flags":["string"],"risk_flags":["string"],"key_advantages":"string","gaps_or_objections":"string","why_promising":"string","cover_letter_hook":"string","talking_points":["string","string","string"],"apply_url":"string"}]',
      '',
      'Balanced scoring: resume fit 30, schedule fit 25, location fit 20, opportunity quality 25.',
      'Promising signals: growth path, training, reputable company, telecom/SaaS/B2B exposure, remote/local convenience, income upside.',
      'Schedule signals: premium for part-time, flexible, student-friendly, 20-30 hrs, or contract flexibility in the description (boards mis-tag often).',
      'Geography: Orillia, Barrie, Simcoe, Muskoka, remote Canada only - penalize frequent GTA onsite commutes.',
      'Penalize rigid 5-day onsite far from Orillia. Boost college-timetable fit from Sept 2026.',
      'cover_letter_hook: 2-3 sentences, paste-ready, references this specific role and one quantified resume win.',
      'talking_points: exactly 3 short bullets (<=120 chars each), each maps a resume strength to something the job description actually asks for.',
    ].join('\n');

    return {
      json: {
        ...job,
        resume_text: resumeText,
        ai_user_prompt,
      },
    };
  })
  .filter(Boolean);

if (!out.length) {
  throw new Error(
    `No valid jobs to score. Skipped: ${skipped.join('; ') || 'none'}`,
  );
}

return out;

// === N8N COPY END ===
