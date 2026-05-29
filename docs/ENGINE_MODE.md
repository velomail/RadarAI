# Engine mode — mock vs live job data

The search pipeline reads **`ENGINE_MODE`**:

| Value | Behavior |
|-------|----------|
| **`mock`** | In-house fixture jobs + heuristic scoring. No RapidAPI, OpenAI, or Resend calls. |
| **unset / anything else** | **Live** — real JSearch, LinkedIn, OpenAI, Resend (requires API keys). |

Use **mock** for MVP demos and UI testing when external APIs are rate-limited or not configured.  
Use **live** when RapidAPI + OpenAI keys are set and you want real job board results.

---

## Local

In `web/.env.local`:

```env
# Mock (no external job/AI APIs)
ENGINE_MODE=mock

# Real data — delete the line or comment it out:
# ENGINE_MODE=mock
```

Restart dev:

```bash
npm run saas:dev
```

---

## Vercel (production)

After changing `ENGINE_MODE` on Vercel you **must redeploy** (env vars are baked in at build/runtime for server functions).

Production URL: **https://rapidai-velomails-projects.vercel.app**

### Switch to mock data (MVP / testing)

From repo root:

```bash
cd web
npx vercel env add ENGINE_MODE production --yes --force --value mock
npx vercel deploy --prod --yes
```

Or from repo root:

```bash
npm run saas:engine:mock
npm run saas:deploy:only
```

### Switch to real data (live APIs)

Requires `RAPIDAPI_KEY`, `OPENAI_API_KEY`, etc. in Vercel env (see [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)).

```bash
cd web
npx vercel env rm ENGINE_MODE production --yes
npx vercel deploy --prod --yes
```

Or from repo root:

```bash
npm run saas:engine:live
npm run saas:deploy:only
```

Removing `ENGINE_MODE` defaults the app to **live** mode.

### Verify which mode is active

Check Vercel → **Project → Settings → Environment Variables** for `ENGINE_MODE`.

During a run, **mock** logs appear in Vercel function logs:

```text
[mock engine] Run … — no RapidAPI / OpenAI / Resend calls
```

```bash
npm run saas:logs
```

---

## Deploy checklist

1. Code deployed: `npm run saas:deploy:only` (or `npm run saas:deploy` to sync all env from `web/.env.local`).
2. Supabase migrations applied (`db/migrations/` including `0006_search_focus.sql`).
3. Choose engine mode (commands above).
4. **Redeploy** after any env change.

See also: [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) · [LOCAL_DEV.md](LOCAL_DEV.md)
