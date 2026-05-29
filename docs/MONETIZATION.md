# Monetization audit — Radar SaaS

Snapshot of what exists today, gaps before charging money, and a sensible path to revenue.  
**No billing is implemented yet** (called out in README “Out of scope for v1”).

---

## What you have today (sellable core)

| Asset | Status |
|--------|--------|
| Anonymous **demo** (`/demo`) | Working — top-of-funnel |
| **Magic-link auth** + onboarding | Working (after SMTP/domain) |
| **Search profiles** + resume storage | DB + UI |
| **AI scoring** (OpenAI) + job cards + cover-letter hooks | Engine in `web/lib/engine/` |
| **On-demand search** (dashboard “Run search”) | Free tier — `schedule_cron = manual` |
| **Scheduled email newsletter** | Pro (coming soon) — cron route only runs `isScheduledNewsletterProfile()` |
| **One-time email on run complete** (optional checkbox) | Free — Resend |
| **Telegram alert on complete** | Free — optional in Settings |
| **Run history** | Dashboard |

**Positioning:** Resume-aware job search **utility** on demand; **paid** = scheduled digest to inbox (newsletter), not the core search tool.

---

## Gaps before you charge

### 1. Billing & plans (critical)

- No Stripe (or Lemon Squeezy) integration  
- No `subscriptions` / `plans` table  
- No paywall: any signed-in user gets full engine + cron  

**Minimum to monetize:** checkout, webhooks, `user_id → plan → limits`, settings page “Manage subscription”.

### 2. Usage limits & unit economics (critical)

All users share **your** API keys (RapidAPI, OpenAI, Resend). One heavy user can burn margin.

| Cost driver | Rough control today |
|-------------|---------------------|
| OpenAI | `OPENAI_MAX_JOBS_TO_SCORE`, concurrency env vars |
| RapidAPI | Per-run queries; no per-user cap |
| Resend | `RESEND_DAILY_HARD_CAP` global, not per user |
| Vercel | 300s function limit; Hobby = 1 cron/day |

**Need:** per-user/month caps — e.g. manual runs/day, profiles count, cron enabled only on paid tier.

### 3. Product polish for paying users

| Gap | Why it matters |
|-----|----------------|
| No pricing page | Can’t convert |
| No ToS / Privacy Policy | Required for paid SaaS |
| No email support / status page | Trust |
| Demo → paid funnel weak | No “save results after signup” |
| Single daily cron (Hobby) | Power users want 2–3×/day → Vercel Pro or external scheduler |

### 4. Technical debt affecting scale

| Item | Notes |
|------|--------|
| Operator-funded API keys | Pass-through or require BYOK for enterprise |
| No admin dashboard | Support/debug hard |
| No analytics (PostHog/Plausible) | Can’t optimize funnel |
| Auth email domain | Blocker for public launch (see `AUTH_EMAIL_SETUP.md`) |

---

## Suggested pricing model (starter)

Align with costs: ~$0.30–1.00 per full run (OpenAI + RapidAPI).

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | 1 demo/run per week, 1 profile, email digest weekly OR manual runs only (no cron) |
| **Pro** | $19–29/mo | 1 profile, daily cron, 30 manual runs/mo, Telegram |
| **Pro+** | $49/mo | 3 profiles, daily cron, 90 manual runs/mo, priority support |

Annual discount (~2 months free) improves cash flow.

**Free tier must be loss-bounded:** cap `OPENAI_MAX_JOBS_TO_SCORE` lower for free users in code (e.g. 8 vs 20).

---

## Implementation order (if you pursue revenue)

1. **Domain + auth for any email** — `AUTH_EMAIL_SETUP.md` (launch blocker)  
2. **Pricing page** + waitlist or Stripe Checkout link  
3. **DB migration** — `subscriptions(user_id, stripe_customer_id, plan, status, current_period_end)`  
4. **Stripe webhooks** — `checkout.session.completed`, `customer.subscription.updated`  
5. **Gate features** — cron eligibility, `run` API, profile count in middleware or engine entry  
6. **Usage metering** — increment `usage_events` per run; hard-stop when over quota  
7. **Legal** — Terms, Privacy, cookie notice  
8. **Upgrade Vercel** when you need >1 cron/day or more bandwidth  

---

## Questions for you (pick directions)

Answer these when you want to prioritize build work:

1. **Audience:** Job seekers only (B2C), or recruiters/agencies (B2B) later?  
2. **Price anchor:** $15/mo impulse vs $49/mo “serious job search”?  
3. **Free tier:** Unlimited demo but paid for daily radar, or time-limited trial?  
4. **Scheduling:** Is daily enough for v1 paid, or is 2–3×/day a must-have (forces Vercel Pro ~$20/mo)?  
5. **BYOK:** Allow users to paste their own OpenAI/RapidAPI keys on a cheaper plan?  
6. **Geography:** Canada/US only (current JSearch `country=ca`) or multi-country soon?  
7. **Moat:** Double down on cover-letter hooks + ATS links, or interview prep / tracking next?

---

## Quick wins (low effort, conversion)

- Post-demo CTA: “Save this run — sign up” (copy `anonymous_session` run to user on signup)  
- Show **pricing** on landing + limit demo to 1 run per IP/day  
- **Profile templates** (“SDR in Toronto”, “Remote React”) to speed onboarding  
- Referral: 1 free month for invite (after Stripe exists)

---

## Summary

You have a **real product** (search → score → notify). To monetize: **verified email domain** (any-user signup), then **Stripe + usage caps**, then **pricing/legal**. The engine and infra on Vercel free tier are enough for early paid beta with daily cadence.
