/** Map Supabase auth errors to clearer copy for the sign-in UI. */
export function formatAuthError(message: string): { title: string; detail: string } {
  const lower = message.toLowerCase();

  if (
    lower.includes('access_denied') ||
    lower.includes('user cancelled') ||
    lower.includes('user canceled')
  ) {
    return {
      title: 'Sign-in cancelled',
      detail: 'You closed the Google or GitHub sign-in window. Try again when ready.',
    };
  }

  if (lower.includes('pkce') || lower.includes('code verifier')) {
    return {
      title: 'Sign-in session expired',
      detail:
        'This usually means OAuth finished on a different URL than where you started (e.g. production Vercel instead of localhost). On localhost, set Supabase Site URL to http://localhost:3000 and add http://localhost:3000/auth/callback to Redirect URLs. See docs/AUTH_OAUTH_SETUP.md.',
    };
  }

  if (lower.includes('redirect') || lower.includes('url') || lower.includes('callback')) {
    return {
      title: 'Redirect URL not allowed',
      detail:
        'Add your app callback to Supabase → Authentication → URL Configuration → Redirect URLs: https://web-ashen-sigma-71.vercel.app/auth/callback** and http://localhost:3000/auth/callback**. See docs/AUTH_OAUTH_SETUP.md.',
    };
  }

  if (lower.includes('provider is not enabled') || lower.includes('unsupported provider')) {
    return {
      title: 'Sign-in provider not enabled',
      detail:
        'Enable Google and GitHub under Supabase → Authentication → Providers. See docs/AUTH_OAUTH_SETUP.md.',
    };
  }

  if (lower.includes('invalid client') || lower.includes('oauth')) {
    return {
      title: 'OAuth configuration error',
      detail:
        'Check Google Cloud / GitHub OAuth app credentials in Supabase → Authentication → Providers. See docs/AUTH_OAUTH_SETUP.md.',
    };
  }

  if (lower.includes('signups not allowed')) {
    return {
      title: 'Sign-ups disabled',
      detail:
        'Enable Authentication → Settings → “Allow new users to sign up” in Supabase, then try again.',
    };
  }

  return { title: 'Sign-in failed', detail: message };
}
