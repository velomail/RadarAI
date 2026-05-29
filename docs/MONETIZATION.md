# Monetization audit — RadarAI

Snapshot of what exists today and path to revenue. **No billing implemented yet.**

---

## What you have today

| Asset | Status |
|--------|--------|
| Google + GitHub OAuth | Working |
| Search workspace (`/dashboard/searches`) | Resume + criteria + inline results |
| AI scoring (OpenAI) + job cards | Engine in `web/lib/engine/` |
| Free tier | 3 searches/day (`user_usage` + RPC) |
| Pro field masking | UI preview — unlock on `plan = pro` |
| Scheduled email digest | Pro — coming soon |
| Telegram alert on complete | Optional in Settings |
| Run history | Past runs on search page |

**Positioning:** Resume-aware job search on demand. **Paid** = unlimited searches + scheduled inbox digest.

---

## Gaps before charging

### Billing & plans

- No Stripe integration
- No paywall beyond daily search cap
- `user_usage.plan` column exists (`free` / `pro`) — ready for webhook

### Usage limits (partially done)

| Control | Status |
|---------|--------|
| 3 searches/day (free) | Enforced in API + UI |
| OpenAI jobs scored | `OPENAI_MAX_JOBS_TO_SCORE` env |
| Adzuna fetch | Per-run query limits |
| Resend | `RESEND_DAILY_HARD_CAP` global |

### Product polish

| Gap | Notes |
|-----|-------|
| Pricing page | Needed to convert |
| ToS / Privacy | Privacy page exists; review before paid launch |
| Stripe checkout | Not wired |

---

## Suggested pricing model

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | 3 searches/day, full results with Pro fields masked |
| **Pro** | $19–29/mo | Unlimited searches, unmasked fields, daily email digest |

Cost drivers: OpenAI scoring (~$0.05–0.15/run) + Adzuna (free tier available).

---

## Implementation order

1. OAuth + live search — done
2. Stripe Checkout + webhook → set `user_usage.plan = 'pro'`
3. Pricing page + upgrade CTA when daily cap hit
4. Wire scheduled cron digest for Pro profiles only

See [AUTH_OAUTH_SETUP.md](AUTH_OAUTH_SETUP.md).
