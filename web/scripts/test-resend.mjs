/**
 * Test Resend API (same key as Supabase SMTP password).
 * Run: node scripts/test-resend.mjs jesse03hiles@gmail.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const to = process.argv[2] || 'jesse03hiles@gmail.com';
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local');

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('Missing web/.env.local');
    process.exit(1);
  }
  const vars = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    vars[key] = val;
  }
  return vars;
}

const env = loadEnv();
const apiKey = env.RESEND_API_KEY;
if (!apiKey?.startsWith('re_')) {
  console.error('RESEND_API_KEY missing or invalid in .env.local (must start with re_)');
  process.exit(1);
}
const from = env.EMAIL_FROM || 'RadarAI <onboarding@resend.dev>';
const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from,
    to: [to],
    subject: 'RadarAI — Resend API test',
    html: '<p>If you received this, your API key works. Use the same key as Supabase SMTP password.</p>',
  }),
});

const body = await res.json().catch(() => ({}));
if (res.ok) {
  console.log('OK — Resend accepted the send. id:', body.id);
  console.log('Check inbox for:', to);
  console.log('If Supabase still fails, the SMTP form fields in Supabase are wrong (not the API key itself).');
} else {
  console.error('FAILED —', res.status, JSON.stringify(body, null, 2));
  if (body?.message?.includes('own email')) {
    console.error('\n→ Sign in / test only with the email on your Resend account, or verify a domain.');
  }
}
