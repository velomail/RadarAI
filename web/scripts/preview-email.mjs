/**
 * Render a sample run-complete email to stdout or a file.
 * Run: node scripts/preview-email.mjs [output.html]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const outPath = process.argv[2];

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const sampleJobs = [
  {
    job_title: 'Sales Development Representative',
    company: 'Acme SaaS',
    match_score: 87,
    publisher: 'LinkedIn',
    source: 'linkedin',
    location: 'Toronto, ON',
    apply_url: 'https://example.com/apply/1',
    cover_letter_hook: 'Your B2B outbound experience maps directly to their ICP motion.',
    ai_scores: {
      role_summary:
        'Outbound SDR on a mid-market SaaS team. You would run sequenced email and LinkedIn outreach, book demos for AEs, and hit weekly SQL targets.',
      experience_match:
        'Your resume shows 14 months of SDR work with CRM hygiene and quota attainment — strong alignment. Gap: no explicit SaaS vertical experience.',
    },
  },
];

function jobCard(j) {
  return `
    <div style="border:1px solid #e1e8ed;border-radius:4px;margin-bottom:16px;">
      <div style="background:#f7f9fa;padding:10px 12px;border-bottom:1px solid #e1e8ed;">
        <strong>${escapeHtml(j.job_title)}</strong> @ ${escapeHtml(j.company)}
        <span style="float:right;font-size:14pt;color:#2b5c8f;">${j.match_score}</span>
      </div>
      <div style="padding:10px 12px;color:#37474f;font-size:10pt;">
        <p style="margin:4px 0;">${escapeHtml(j.publisher)} · ${escapeHtml(j.location)}</p>
        <p style="margin:8px 0;"><strong>Role:</strong> ${escapeHtml(j.ai_scores.role_summary)}</p>
        <p style="margin:8px 0;"><strong>Your fit:</strong> ${escapeHtml(j.ai_scores.experience_match)}</p>
        <p style="margin:8px 0;font-style:italic;">${escapeHtml(j.cover_letter_hook)}</p>
        <p style="margin:8px 0;"><a href="${escapeHtml(j.apply_url)}">Apply &rarr;</a></p>
      </div>
    </div>`;
}

const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#2c3e50;max-width:600px;margin:0 auto;padding:16px;">
  <h2>Search results — Toronto SDR roles</h2>
  <p style="background:#d93025;color:#fff;padding:8px 12px;border-radius:4px;font-weight:bold;">3 FRESH (&lt;6h) · 12 matches</p>
  ${sampleJobs.map(jobCard).join('')}
  <p style="margin:16px 0;"><a href="http://localhost:3000/dashboard/runs/sample">See all 12 matches &rarr;</a></p>
</body></html>`;

if (outPath) {
  const resolved = path.resolve(outPath);
  fs.writeFileSync(resolved, html, 'utf8');
  console.log('Wrote', resolved);
} else {
  console.log(html);
}
