/**
 * Parse OpenAI / model output -> single HTML report for Telegram.
 *
 * Behavior:
 *  - Cross-references each AI-scored job back to Clean Jobs to enrich with
 *    posted_at, publisher, direct_ats indicator, and LinkedIn company snapshot.
 *  - Adds a freshness bonus to quality_index so newer jobs surface first.
 *  - Renders a freshness badge, direct-ATS indicator, company snapshot,
 *    plus an Application Kit block (cover letter hook + 3 talking points).
 *  - Guarantees at least MIN_REPORT_JOBS (3) cards every run by topping up
 *    from the next highest ranked jobs, labelled "Lower quality day".
 *  - Emits json.caption (Telegram-ready) with a "FRESH" prefix when any
 *    displayed job is less than 6 hours old.
 *
 * n8n Code node: JavaScript, "Run Once for All Items"
 * Place AFTER "Message a model", BEFORE "Save Seen Jobs".
 */

// === N8N COPY START ===

const MIN_SCORE = 70;
const PROMISING_MIN_SCORE = 65;
const MIN_REPORT_JOBS = 3;
const MAX_REPORT_JOBS = 12;

const FRESH_HOURS = 6;
const WARM_HOURS = 24;
const RECENT_HOURS = 72;

function extractModelText(item) {
  const j = item?.json ?? {};
  const candidates = [
    j.output,
    j.text,
    j.content,
    j.message?.content,
    j.response?.output,
    j.response?.text,
    j.choices?.[0]?.message?.content,
    j.data?.[0]?.output,
    j.data?.[0]?.text,
  ];
  for (const c of candidates) {
    if (c == null) continue;
    if (typeof c === 'string' && c.trim()) return c.trim();
    if (Array.isArray(c)) {
      for (const part of c) {
        if (typeof part === 'string' && part.trim()) return part.trim();
        if (part?.type === 'output_text' && part.text) return String(part.text).trim();
        if (part?.text) return String(part.text).trim();
        if (part?.content?.[0]?.text) return String(part.content[0].text).trim();
      }
    }
    if (typeof c === 'object' && typeof c.text === 'string' && c.text.trim()) {
      return c.text.trim();
    }
  }
  return null;
}

function parseJobsFromText(raw) {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') return [parsed];
  return [];
}

function parseJobsFromItems(items) {
  const jobs = [];
  for (const item of items) {
    const j = item.json ?? {};
    if (Array.isArray(j) && j[0]?.job_title) {
      jobs.push(...j);
      continue;
    }
    if (j.job_title && j.match_score != null) {
      jobs.push(j);
      continue;
    }
    const raw = extractModelText(item);
    if (!raw) continue;
    try {
      jobs.push(...parseJobsFromText(raw));
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          jobs.push(...parseJobsFromText(match[0]));
        } catch {}
      }
    }
  }
  return jobs;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (!value) return [];
  return [String(value)];
}

function canonicalUrl(url) {
  if (!url) return '';
  return String(url)
    .trim()
    .replace(/#.*$/, '')
    .replace(/[?&]utm_[^=&]+=[^&]*/gi, '')
    .replace(/[?&]$/, '')
    .toLowerCase();
}

function jobKey(job) {
  if (job && job.job_id) return `id:${job.job_id}`;
  const url = (job && (job.apply_url || job.apply_url_canonical || job.job_apply_link)) || '';
  if (!url) return '';
  return `url:${canonicalUrl(url)}`;
}

function ageHours(postedAt) {
  if (!postedAt) return null;
  const t = new Date(postedAt).getTime();
  if (!Number.isFinite(t)) return null;
  const h = (Date.now() - t) / 3600000;
  return h < 0 ? null : h;
}

function freshnessTier(hours) {
  if (hours == null) return 'unknown';
  if (hours < FRESH_HOURS) return 'fresh';
  if (hours < WARM_HOURS) return 'warm';
  if (hours < RECENT_HOURS) return 'recent';
  return 'stale';
}

function freshnessBonus(hours) {
  if (hours == null) return 0;
  if (hours < FRESH_HOURS) return 8;
  if (hours < WARM_HOURS) return 4;
  if (hours < RECENT_HOURS) return 1;
  return 0;
}

function freshnessLabel(hours) {
  if (hours == null) return '';
  if (hours < 1) return `FRESH · just now`;
  if (hours < FRESH_HOURS) return `FRESH · ${Math.round(hours)}h ago`;
  if (hours < WARM_HOURS) return `${Math.round(hours)}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function badgeStyle(tier) {
  switch (tier) {
    case 'fresh':
      return 'background:#d93025;color:#fff;';
    case 'warm':
      return 'background:#f29d12;color:#fff;';
    case 'recent':
      return 'background:#5f7d95;color:#fff;';
    case 'stale':
      return 'background:#cfd8dc;color:#37474f;';
    default:
      return 'background:#cfd8dc;color:#37474f;';
  }
}

function buildCleanLookup() {
  const lookup = new Map();
  try {
    const items = $('Clean Jobs').all();
    for (const item of items) {
      const j = item.json || {};
      const idKey = j.job_id ? `id:${j.job_id}` : '';
      const urlKey = j.apply_url_canonical
        ? `url:${j.apply_url_canonical}`
        : j.apply_url
          ? `url:${canonicalUrl(j.apply_url)}`
          : '';
      if (idKey) lookup.set(idKey, j);
      if (urlKey && !lookup.has(urlKey)) lookup.set(urlKey, j);
    }
  } catch {
    // Clean Jobs not reachable; lookup stays empty.
  }
  return lookup;
}

const cleanLookup = buildCleanLookup();

function enrichFromClean(job) {
  const keyById = job.job_id ? `id:${job.job_id}` : '';
  const keyByUrl = job.apply_url ? `url:${canonicalUrl(job.apply_url)}` : '';
  const src = cleanLookup.get(keyById) || cleanLookup.get(keyByUrl) || {};
  return {
    posted_at: src.posted_at || '',
    publisher: src.publisher || '',
    source: src.source || '',
    direct_ats: !!src.direct_ats,
    external_apply_url: src.external_apply_url || '',
    linkedin_url: src.linkedin_url || '',
    company_employees: src.company_employees || '',
    company_size: src.company_size || '',
    company_industry: src.company_industry || '',
    company_followers: src.company_followers || '',
    seniority: src.seniority || '',
    employment_type: src.employment_type || '',
    location: src.location || '',
    is_remote: !!src.is_remote,
  };
}

function normalizeJob(job) {
  const enrichment = enrichFromClean(job);
  const resume = toNumber(job.resume_fit_score);
  const schedule = toNumber(job.schedule_fit_score);
  const location = toNumber(job.location_fit_score);
  const opportunity = toNumber(job.opportunity_score);
  const modelScore = toNumber(job.match_score);
  const subtotal = resume + schedule + location + opportunity;
  const matchScore = modelScore > 0 ? modelScore : subtotal;
  const qualityFlags = toList(job.quality_flags);
  const riskFlags = toList(job.risk_flags);
  const talkingPoints = toList(job.talking_points).slice(0, 3);

  const ageH = ageHours(enrichment.posted_at);
  const tier = freshnessTier(ageH);
  const freshBonus = freshnessBonus(ageH);

  let qualityTier = 'Promising';
  if (matchScore >= 85 && Math.min(resume || 30, schedule || 25, location || 20) >= 14) {
    qualityTier = 'High Quality';
  } else if (matchScore < MIN_SCORE) {
    qualityTier = 'Watchlist';
  }

  const promisingSignal =
    opportunity >= 18 ||
    qualityFlags.some((flag) =>
      /growth|training|remote|hybrid|local|commission|income|telecom|saas|b2b|flex/i.test(flag),
    );

  const include =
    matchScore >= MIN_SCORE ||
    (matchScore >= PROMISING_MIN_SCORE &&
      promisingSignal &&
      (location >= 14 || schedule >= 14) &&
      riskFlags.length <= 2);

  const qualityIndex =
    matchScore +
    Math.min(6, qualityFlags.length * 2) -
    Math.min(8, riskFlags.length * 2) +
    (promisingSignal ? 3 : 0) +
    freshBonus +
    (enrichment.direct_ats ? 2 : 0);

  const preferredApplyUrl =
    enrichment.external_apply_url ||
    job.apply_url ||
    enrichment.linkedin_url ||
    '';

  return {
    ...job,
    ...enrichment,
    apply_url: preferredApplyUrl,
    cover_letter_hook: typeof job.cover_letter_hook === 'string' ? job.cover_letter_hook : '',
    talking_points: talkingPoints,
    match_score: Math.round(matchScore),
    resume_fit_score: resume,
    schedule_fit_score: schedule,
    location_fit_score: location,
    opportunity_score: opportunity,
    quality_flags: qualityFlags,
    risk_flags: riskFlags,
    quality_tier: qualityTier,
    quality_index: qualityIndex,
    age_hours: ageH,
    freshness_tier: tier,
    freshness_label: freshnessLabel(ageH),
    include,
  };
}

function renderCompanySnapshot(job) {
  const parts = [];
  if (job.company_industry) parts.push(escapeHtml(job.company_industry));
  if (job.company_size) parts.push(escapeHtml(job.company_size) + ' employees');
  else if (job.company_employees) parts.push(escapeHtml(job.company_employees) + ' employees');
  if (job.company_followers)
    parts.push(escapeHtml(Number(job.company_followers).toLocaleString()) + ' LinkedIn followers');
  if (!parts.length) return '';
  return `<p style="margin:6px 0;color:#546e7a;font-size:9pt;">${parts.join(' &middot; ')}</p>`;
}

function renderApplyBlock(job) {
  const direct = job.direct_ats;
  const badge = direct
    ? `<span style="background:#2e7d32;color:#fff;padding:2px 6px;border-radius:3px;font-size:8pt;margin-right:6px;">DIRECT ATS</span>`
    : `<span style="background:#eeeeee;color:#37474f;padding:2px 6px;border-radius:3px;font-size:8pt;margin-right:6px;">${escapeHtml(job.source || 'job board')}</span>`;
  const linkedinSecondary =
    direct && job.linkedin_url && job.linkedin_url !== job.apply_url
      ? ` &middot; <a href="${escapeHtml(job.linkedin_url)}" style="color:#546e7a;font-size:9pt;">view on LinkedIn</a>`
      : '';
  return `<p style="margin:10px 0;">${badge}<a href="${escapeHtml(job.apply_url || '#')}" style="font-weight:bold;">Apply &rarr;</a>${linkedinSecondary}</p>`;
}

function renderApplicationKit(job) {
  if (!job.cover_letter_hook && (!job.talking_points || !job.talking_points.length)) return '';
  const hookHtml = job.cover_letter_hook
    ? `<div style="margin:8px 0;"><strong>Cover letter hook:</strong><br/><em style="color:#37474f;">${escapeHtml(job.cover_letter_hook)}</em></div>`
    : '';
  const pointsHtml =
    job.talking_points && job.talking_points.length
      ? `<div style="margin:8px 0;"><strong>Screener talking points:</strong><ul style="margin:4px 0 4px 18px;padding:0;">${job.talking_points
          .map((p) => `<li>${escapeHtml(p)}</li>`)
          .join('')}</ul></div>`
      : '';
  return `<div style="background:#f7f9fa;border-left:3px solid #2b5c8f;padding:10px 12px;margin:10px 0;">${hookHtml}${pointsHtml}</div>`;
}

function renderFreshnessBadge(job) {
  if (!job.freshness_label) return '';
  const style = badgeStyle(job.freshness_tier);
  return `<span style="${style}padding:2px 8px;border-radius:10px;font-size:9pt;font-weight:bold;margin-left:8px;">${escapeHtml(job.freshness_label)}</span>`;
}

function renderCard(job) {
  return `
  <div class="card">
    <div class="head">
      <strong>${escapeHtml(job.job_title)}</strong> @ ${escapeHtml(job.company)}
      ${renderFreshnessBadge(job)}
      <span style="float:right;font-size:14pt;color:#2b5c8f;">${escapeHtml(job.match_score)}</span>
    </div>
    <div style="padding:12px;">
      <p style="margin:4px 0;"><strong>Tier:</strong> ${escapeHtml(job.quality_tier)} &middot; <strong>Verdict:</strong> ${escapeHtml(job.fit_verdict || 'N/A')} &middot; <strong>Source:</strong> ${escapeHtml(job.publisher || job.source || 'unknown')}</p>
      ${renderCompanySnapshot(job)}
      <p style="margin:6px 0;"><strong>Score breakdown:</strong> Resume ${escapeHtml(job.resume_fit_score)}/30 &middot; Schedule ${escapeHtml(job.schedule_fit_score)}/25 &middot; Location ${escapeHtml(job.location_fit_score)}/20 &middot; Opportunity ${escapeHtml(job.opportunity_score)}/25</p>
      <p style="margin:6px 0;"><strong>Advantages:</strong> ${escapeHtml(job.key_advantages || 'N/A')}</p>
      <p style="margin:6px 0;"><strong>Why promising:</strong> ${escapeHtml(job.why_promising || 'N/A')}</p>
      <p style="margin:6px 0;"><strong>Gaps:</strong> ${escapeHtml(job.gaps_or_objections || 'N/A')}</p>
      <p style="margin:6px 0;color:#546e7a;font-size:9pt;"><strong>Quality signals:</strong> ${escapeHtml((job.quality_flags || []).join(', ') || 'N/A')}</p>
      <p style="margin:6px 0;color:#546e7a;font-size:9pt;"><strong>Risks:</strong> ${escapeHtml((job.risk_flags || []).join(', ') || 'None flagged')}</p>
      ${renderApplicationKit(job)}
      ${renderApplyBlock(job)}
    </div>
  </div>`;
}

const incomingItems = $input.all();
const parsedJobs = parseJobsFromItems(incomingItems);

if (!parsedJobs.length) {
  const sample = incomingItems[0]?.json ?? {};
  throw new Error(
    `Could not parse AI job scores. Top-level keys: ${Object.keys(sample).join(', ')}`,
  );
}

const allNormalized = parsedJobs
  .map(normalizeJob)
  .sort((a, b) => b.quality_index - a.quality_index);

const qualified = allNormalized.filter((job) => job.include);

let displayed;
let floored = false;
let bannerLabel;

if (qualified.length >= MIN_REPORT_JOBS) {
  displayed = qualified.slice(0, MAX_REPORT_JOBS);
  bannerLabel = 'Quality matches';
} else {
  floored = true;
  const fillerNeeded = MIN_REPORT_JOBS - qualified.length;
  const extras = allNormalized
    .filter((job) => !job.include)
    .slice(0, Math.max(fillerNeeded, MIN_REPORT_JOBS - qualified.length))
    .map((job) => ({ ...job, quality_tier: 'Lower quality day' }));
  displayed = [...qualified, ...extras].slice(0, MIN_REPORT_JOBS);
  bannerLabel = `Lower quality day, top ${displayed.length} of ${allNormalized.length} scanned`;
}

const omittedCount = Math.max(0, qualified.length - displayed.length);

const freshCount = displayed.filter((j) => j.freshness_tier === 'fresh').length;
const warmCount = displayed.filter((j) => j.freshness_tier === 'warm').length;
const directAtsCount = displayed.filter((j) => j.direct_ats).length;

const allScoredKeys = Array.from(
  new Set(allNormalized.map(jobKey).filter(Boolean)),
);

let fetchSummary = {};
try {
  fetchSummary = $('Fetch All Sources').first().json || {};
} catch {
  try {
    fetchSummary = $('Fetch JSearch Jobs').first().json || {};
  } catch {}
}
const sourcesBreakdown = fetchSummary.sources_breakdown || {};
const sourcesText =
  Object.entries(sourcesBreakdown)
    .map(([src, count]) => `${count} ${src}`)
    .join(' + ') || 'jsearch';

const reportDate = new Date().toLocaleString('en-CA', {
  timeZone: 'America/Toronto',
  dateStyle: 'medium',
  timeStyle: 'short',
});

let htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; color: #2c3e50; line-height: 1.5; font-size: 10pt; max-width: 760px; margin: 16px auto; padding: 0 12px; }
  .card { margin-bottom: 24px; border: 1px solid #e1e8ed; border-radius: 4px; }
  .head { background: #f7f9fa; padding: 12px; border-bottom: 1px solid #e1e8ed; }
  .banner { padding: 12px; border-radius: 4px; margin-bottom: 16px; background: #eef5fb; }
  .banner.warn { background: #fff7e6; }
  a { color: #2b5c8f; }
</style>
</head>
<body>
  <h1 style="margin:8px 0;">Quality Job Matches</h1>
  <p style="color:#546e7a;">Generated ${escapeHtml(reportDate)} · America/Toronto</p>
  <div class="banner${floored ? ' warn' : ''}">
    <strong>${escapeHtml(bannerLabel)}</strong><br/>
    Scanned ${allNormalized.length} scored jobs from ${escapeHtml(sourcesText)}${fetchSummary.widened ? ' · widened search' : ''}.<br/>
    ${freshCount} fresh (&lt;6h) · ${warmCount} warm (&lt;24h) · ${directAtsCount} direct-ATS apply links.
  </div>
`;

if (omittedCount > 0) {
  htmlContent += `<p>${omittedCount} additional lower-ranked match(es) were omitted to keep the report focused.</p>`;
}

for (const job of displayed) {
  htmlContent += renderCard(job);
}

htmlContent += `</body></html>`;

const topJob = displayed[0];
const captionLines = [];
if (freshCount > 0) {
  captionLines.push(`🔥 ${freshCount} FRESH (<6h)`);
}
if (floored) {
  captionLines.push(`Lower quality day · top ${displayed.length} of ${allNormalized.length} scanned`);
} else {
  captionLines.push(`${displayed.length} quality match${displayed.length === 1 ? '' : 'es'} today`);
}
captionLines.push(`${allNormalized.length} scanned across ${sourcesText}`);
if (topJob) {
  const titleSnip = String(topJob.job_title || '').slice(0, 50);
  const companySnip = String(topJob.company || '').slice(0, 40);
  const ageSnip = topJob.freshness_label ? ` · ${topJob.freshness_label}` : '';
  captionLines.push(`Top: ${titleSnip} @ ${companySnip} (${topJob.match_score})${ageSnip}`);
}
const caption = captionLines.join('\n').slice(0, 1000);

return [
  {
    json: {
      html: htmlContent,
      caption,
      match_count: displayed.length,
      parsed_count: allNormalized.length,
      qualified_count: qualified.length,
      omitted_count: omittedCount,
      fresh_count: freshCount,
      warm_count: warmCount,
      direct_ats_count: directAtsCount,
      floored,
      banner_label: bannerLabel,
      sources_breakdown: sourcesBreakdown,
      widened: !!fetchSummary.widened,
      all_scored_keys: allScoredKeys,
      jobs: displayed,
    },
  },
];

// === N8N COPY END ===
