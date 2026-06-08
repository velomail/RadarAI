# Auth pages — `/sign-in`, `/sign-up`

## Shared layout (Auth shell)

- `gradient-mesh min-h-screen flex flex-col`
- Floating background orbs (same as landing)
- Top header: Radar icon + **RadarAI** link to `/`
- Centered section `max-w-md`

## Sign up `/sign-up`

**H1:** Create your account  
**Sub:** Save resume-backed searches and run them whenever you're job hunting.

**Glass card** contains:

1. Optional error box (red border, title + detail from OAuth failures)
2. **OAuthButtons** — stacked full width:
   - Continue with Google (Google color icon)
   - Continue with GitHub (GitHub icon)
   - Height `h-12`, `rounded-xl`, `glass` outline variant
   - Loading state: `Redirecting…`

**Footer link:** Already signed up? **Sign in**

## Sign in `/sign-in`

**H1:** Welcome back  
**Sub:** Sign in to continue your on-demand job search

Same OAuth card. **Footer link:** New here? **Create an account**

## Error states

Formatted messages for:

- Sign-ups disabled
- Provider not enabled
- Invalid/expired session
- Generic OAuth errors

Display: `border-destructive/40 bg-destructive/10`, title bold + detail line.

## Post-auth

OAuth redirects to `/auth/callback` → **`/dashboard/searches`**

## Do NOT include

- Email input / magic link
- Password fields
- Social providers beyond Google + GitHub
- Terms checkbox (no ToS page yet)

## Mobile

- Card padding `p-5 sm:p-8`
- H1 `text-2xl sm:text-3xl`
- Safe-area top on header
