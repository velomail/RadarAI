# RadarAI web app (SaaS)

Next.js app deployed from the **repo root** (root `vercel.json` builds `web/`).

- Local dev: `cp .env.example .env.local` then `npm run dev`
- Docs: `../docs/CONNECT_SERVICES.md`, `../docs/LOCAL_DEV.md`, `../docs/AUTH_OAUTH_SETUP.md`
- Engine: `lib/engine/` (Adzuna fetch + OpenAI scoring, no n8n)

From repo root: `npm run saas:dev` · `npm run saas:deploy:only`
