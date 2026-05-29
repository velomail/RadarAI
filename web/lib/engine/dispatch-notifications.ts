import { isMockEngine, mockEngineLabel } from './engine-mode';
import { APP_NAME, DEFAULT_EMAIL_FROM } from '../brand';
import { SEARCH_PAGE } from '../constants';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Job, SearchProfile } from '../types';

const RESEND_URL = 'https://api.resend.com/emails';

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface SummaryForEmail {
  match_count: number;
  fresh_count: number;
  banner_label: string | null;
}

function jobCardHtml(j: Job): string {
  const roleSummary = j.ai_scores?.role_summary || j.why_promising;
  const experienceMatch = j.ai_scores?.experience_match || j.key_advantages;

  return `
    <div style="border:1px solid #e1e8ed;border-radius:4px;margin-bottom:16px;">
      <div style="background:#f7f9fa;padding:10px 12px;border-bottom:1px solid #e1e8ed;">
        <strong>${escapeHtml(j.job_title)}</strong> @ ${escapeHtml(j.company)}
        <span style="float:right;font-size:14pt;color:#2b5c8f;">${j.match_score}</span>
      </div>
      <div style="padding:10px 12px;color:#37474f;font-size:10pt;">
        <p style="margin:4px 0;">${escapeHtml(j.publisher || j.source)} · ${escapeHtml(j.location || '')}${j.direct_ats ? ' · <span style="background:#2e7d32;color:#fff;padding:2px 6px;border-radius:3px;font-size:8pt;">DIRECT ATS</span>' : ''}</p>
        ${roleSummary ? `<p style="margin:8px 0;"><strong>Role:</strong> ${escapeHtml(roleSummary)}</p>` : ''}
        ${experienceMatch ? `<p style="margin:8px 0;"><strong>Your fit:</strong> ${escapeHtml(experienceMatch)}</p>` : ''}
        ${j.cover_letter_hook ? `<p style="margin:8px 0;font-style:italic;color:#37474f;">${escapeHtml(j.cover_letter_hook)}</p>` : ''}
        <p style="margin:8px 0;"><a href="${escapeHtml(j.apply_url)}" style="color:#2b5c8f;font-weight:bold;">Apply &rarr;</a></p>
      </div>
    </div>`;
}

function emailHtml({
  profileName,
  runUrl,
  summary,
  jobs,
  isDigest,
}: {
  profileName: string;
  runUrl: string;
  summary: SummaryForEmail;
  jobs: Job[];
  isDigest: boolean;
}): string {
  const headline = isDigest
    ? `Your ${APP_NAME} digest — ${escapeHtml(profileName)}`
    : `Search results — ${escapeHtml(profileName)}`;

  const banner =
    summary.match_count === 0
      ? `<p style="background:#eef5fb;color:#2b5c8f;padding:8px 12px;border-radius:4px;font-weight:bold;margin:0 0 16px;">No matches met your criteria this run. Try widening keywords or lowering the minimum score.</p>`
      : summary.fresh_count > 0
        ? `<p style="background:#d93025;color:#fff;padding:8px 12px;border-radius:4px;font-weight:bold;margin:0 0 16px;">${summary.fresh_count} FRESH (&lt;6h) · ${summary.match_count} matches</p>`
        : `<p style="background:#eef5fb;color:#2b5c8f;padding:8px 12px;border-radius:4px;font-weight:bold;margin:0 0 16px;">${escapeHtml(summary.banner_label || 'Quality matches')} · ${summary.match_count} matches</p>`;

  const cards = jobs.length > 0 ? jobs.slice(0, 5).map(jobCardHtml).join('') : '';

  const footer =
    summary.match_count > 0
      ? `<p style="margin:16px 0;"><a href="${escapeHtml(runUrl)}" style="background:#2b5c8f;color:#fff;padding:8px 14px;border-radius:4px;text-decoration:none;">See all ${summary.match_count} matches in your dashboard &rarr;</a></p>`
      : `<p style="margin:16px 0;"><a href="${escapeHtml(runUrl)}" style="background:#2b5c8f;color:#fff;padding:8px 14px;border-radius:4px;text-decoration:none;">View run details in your dashboard &rarr;</a></p>`;

  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#2c3e50;max-width:600px;margin:0 auto;padding:16px;">
  <h2 style="margin:0 0 8px;">${headline}</h2>
  ${banner}
  ${cards}
  ${footer}
</body></html>`;
}

function telegramText({
  profileName,
  summary,
  jobs,
}: {
  profileName: string;
  summary: SummaryForEmail;
  jobs: Job[];
}): string {
  const lines: string[] = [];
  if (summary.match_count === 0) {
    lines.push(`No matches — ${profileName}`);
    return lines.join('\n').slice(0, 1000);
  }
  if (summary.fresh_count > 0) lines.push(`🔥 ${summary.fresh_count} FRESH (<6h)`);
  lines.push(`${summary.match_count} matches — ${profileName}`);
  const top = jobs[0];
  if (top) {
    lines.push(
      `Top: ${String(top.job_title).slice(0, 50)} @ ${String(top.company).slice(0, 40)} (${top.match_score})`,
    );
  }
  return lines.join('\n').slice(0, 1000);
}

export interface DispatchResult {
  dispatched: Array<{ run_id: string; channel: 'email' | 'telegram'; to: string }>;
  skipped: Array<{ run_id: string; channel: 'email' | 'telegram'; reason: string }>;
  email_budget: { used_today: number; cap: number };
}

async function readEmailBudgetUsed(sb: SupabaseClient): Promise<number> {
  try {
    const { data, error } = await sb.rpc('current_email_budget');
    if (error) {
      console.warn('current_email_budget RPC failed:', error.message);
      return 0;
    }
    return Number(data) || 0;
  } catch {
    return 0;
  }
}

async function bumpEmailBudget(sb: SupabaseClient): Promise<number> {
  try {
    const { data, error } = await sb.rpc('increment_email_budget');
    if (error) {
      console.warn('increment_email_budget RPC failed:', error.message);
      return Infinity;
    }
    return Number(data) || 0;
  } catch {
    return Infinity;
  }
}

export async function dispatchNotifications(
  sb: SupabaseClient,
  runId: string,
): Promise<DispatchResult> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
  const EMAIL_FROM = process.env.EMAIL_FROM || DEFAULT_EMAIL_FROM;
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com';
  const RESEND_DAILY_HARD_CAP = Number(process.env.RESEND_DAILY_HARD_CAP || 90);

  const dispatched: DispatchResult['dispatched'] = [];
  const skipped: DispatchResult['skipped'] = [];

  const { data: run, error: runErr } = await sb
    .from('runs')
    .select('*')
    .eq('id', runId)
    .maybeSingle();

  if (runErr) {
    console.warn('dispatchNotifications: run fetch failed:', runErr.message);
    return { dispatched, skipped, email_budget: { used_today: 0, cap: RESEND_DAILY_HARD_CAP } };
  }

  if (!run) {
    skipped.push({ run_id: runId, channel: 'email', reason: 'run_not_found' });
    return { dispatched, skipped, email_budget: { used_today: 0, cap: RESEND_DAILY_HARD_CAP } };
  }

  if (!run.search_profile_id) {
    skipped.push({ run_id: runId, channel: 'email', reason: 'no_search_profile' });
    return { dispatched, skipped, email_budget: { used_today: 0, cap: RESEND_DAILY_HARD_CAP } };
  }

  const { data: profile, error: profileErr } = await sb
    .from('search_profiles')
    .select('*')
    .eq('id', run.search_profile_id)
    .maybeSingle();

  if (profileErr || !profile) {
    skipped.push({
      run_id: runId,
      channel: 'email',
      reason: profileErr?.message || 'profile_not_found',
    });
    return { dispatched, skipped, email_budget: { used_today: 0, cap: RESEND_DAILY_HARD_CAP } };
  }

  const searchProfile = profile as SearchProfile;

  const summary: SummaryForEmail = {
    match_count: run.reported_count || 0,
    fresh_count: run.fresh_count || 0,
    banner_label: run.banner_label,
  };

  const { data: jobs } = await sb
    .from('jobs')
    .select('*')
    .eq('run_id', runId)
    .order('match_score', { ascending: false })
    .limit(5);

  const jobsList: Job[] = Array.isArray(jobs) ? (jobs as Job[]) : [];
  const runUrl = run.search_profile_id
    ? `${APP_URL}${SEARCH_PAGE}?run=${runId}`
    : `${APP_URL}/dashboard/runs/${runId}`;

  let emailBudgetUsed = await readEmailBudgetUsed(sb);

  const notifyEmail = searchProfile.notify_email?.trim() || null;
  const wantsEmail = !!notifyEmail;

  if (wantsEmail && isMockEngine() && notifyEmail) {
    console.info(
      `${mockEngineLabel()} Email → ${notifyEmail} · ${summary.match_count} matches · ${runUrl}`,
    );
    dispatched.push({ run_id: runId, channel: 'email', to: notifyEmail });
  } else if (wantsEmail && !RESEND_API_KEY) {
    skipped.push({ run_id: runId, channel: 'email', reason: 'missing_resend_api_key' });
  } else if (wantsEmail && emailBudgetUsed >= RESEND_DAILY_HARD_CAP) {
    skipped.push({
      run_id: runId,
      channel: 'email',
      reason: `resend_daily_cap_reached (${emailBudgetUsed}/${RESEND_DAILY_HARD_CAP})`,
    });
  } else if (wantsEmail && notifyEmail) {
    try {
      const res = await fetch(RESEND_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [notifyEmail],
          subject:
            run.trigger === 'schedule'
              ? summary.match_count === 0
                ? `Your ${APP_NAME} digest · no new matches`
                : summary.fresh_count > 0
                  ? `Your ${APP_NAME} digest · ${summary.fresh_count} fresh roles`
                  : `${summary.match_count} matches · ${searchProfile.name}`
              : summary.match_count === 0
                ? `Search complete · no matches · ${searchProfile.name}`
                : `Search results ready · ${searchProfile.name}`,
          html: emailHtml({
            profileName: searchProfile.name || APP_NAME,
            runUrl,
            summary,
            jobs: jobsList,
            isDigest: run.trigger === 'schedule',
          }),
        }),
      });
      if (res.ok) {
        emailBudgetUsed = await bumpEmailBudget(sb);
        dispatched.push({ run_id: runId, channel: 'email', to: notifyEmail });
      } else {
        const errBody = await res.text().catch(() => '');
        console.warn('Resend send failed:', res.status, errBody);
        skipped.push({
          run_id: runId,
          channel: 'email',
          reason: `resend_${res.status}: ${errBody.slice(0, 200)}`,
        });
      }
    } catch (e) {
      const msg = (e as Error).message;
      console.warn('Resend send failed:', msg);
      skipped.push({ run_id: runId, channel: 'email', reason: msg });
    }
  }

  const chatId = searchProfile.notify_telegram_chat_id?.trim() || null;
  if (chatId && !TELEGRAM_BOT_TOKEN) {
    skipped.push({ run_id: runId, channel: 'telegram', reason: 'missing_telegram_bot_token' });
  } else if (chatId && TELEGRAM_BOT_TOKEN) {
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramText({
            profileName: searchProfile.name || APP_NAME,
            summary,
            jobs: jobsList,
          }),
          disable_web_page_preview: true,
        }),
      });
      if (tgRes.ok) {
        dispatched.push({ run_id: runId, channel: 'telegram', to: chatId });
      } else {
        const errBody = await tgRes.text().catch(() => '');
        skipped.push({
          run_id: runId,
          channel: 'telegram',
          reason: `telegram_${tgRes.status}: ${errBody.slice(0, 200)}`,
        });
      }
    } catch (e) {
      skipped.push({ run_id: runId, channel: 'telegram', reason: (e as Error).message });
    }
  }

  if (skipped.length) {
    console.info('dispatchNotifications skipped:', JSON.stringify(skipped));
  }

  return {
    dispatched,
    skipped,
    email_budget: { used_today: emailBudgetUsed, cap: RESEND_DAILY_HARD_CAP },
  };
}

export { emailHtml, escapeHtml };
