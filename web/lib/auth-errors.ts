/** Map Supabase auth errors to clearer copy for the sign-in UI. */
export function formatAuthError(message: string): { title: string; detail: string } {
  const lower = message.toLowerCase();
  if (
    lower.includes('code challenge') ||
    lower.includes('code_verifier') ||
    lower.includes('bad_code_verifier')
  ) {
    return {
      title: 'Sign-in link expired or wrong browser',
      detail:
        'Request a fresh link below, then open it in this same browser tab (not a different browser or Gmail in-app preview). Use only http://localhost:3000 — not 127.0.0.1. Old links fail after a new request.',
    };
  }
  if (lower.includes('signups not allowed for otp') || lower.includes('otp_disabled')) {
    return {
      title: 'Sign-ups disabled in Supabase',
      detail:
        'Turn on Authentication → Providers → Email → “Enable Email provider” and “Confirm email” (or disable confirm if you want instant access). Also enable Authentication → Settings → “Allow new users to sign up”. Then try again with jesse03hiles@gmail.com.',
    };
  }
  if (lower.includes('only send testing emails to your own email')) {
    const match = message.match(/your own email address \(([^)]+)\)/i);
    const allowed = match?.[1] ?? 'your Resend account email';
    return {
      title: 'Wrong email for test sender',
      detail: `With sender onboarding@resend.dev, magic links can only go to ${allowed}. You entered a different address — use that exact email on sign-in, or verify a domain at resend.com/domains.`,
    };
  }
  if (
    lower.includes('confirmation email') ||
    lower.includes('sending email') ||
    lower.includes('smtp')
  ) {
    return {
      title: 'Could not send sign-in email',
      detail:
        'Check Supabase → Logs → Auth for details. With onboarding@resend.dev, sign in using the same email as your Resend account, or verify a domain and change the SMTP sender.',
    };
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return {
      title: 'Email rate limit exceeded',
      detail:
        'Supabase limits how many magic-link emails can be sent per hour (often ~4 per address while testing). Wait about an hour, use the last link in your inbox, or configure custom SMTP with Resend in Supabase → Authentication → SMTP (see docs/PROVISIONING.md).',
    };
  }
  if (lower.includes('redirect') || lower.includes('url')) {
    return {
      title: 'Redirect URL not allowed',
      detail:
        'Add every URL you use to Supabase → Authentication → URL Configuration → Redirect URLs: http://localhost:3000/auth/callback**, https://rapidai-velomails-projects.vercel.app/auth/callback**, https://web-ashen-sigma-71.vercel.app/auth/callback**',
    };
  }
  if (
    lower.includes('otp_expired') ||
    lower.includes('access_denied') ||
    (lower.includes('expired') && lower.includes('email')) ||
    (lower.includes('invalid') && lower.includes('has expired'))
  ) {
    return {
      title: 'Email link expired or already used',
      detail:
        'Magic links expire quickly and work only once. Go to Sign in, request a new link, and open only the newest email in this same browser (not Gmail preview). Do not click older emails.',
    };
  }
  if (lower.includes('invalid') && lower.includes('link')) {
    return {
      title: 'Link expired or already used',
      detail:
        'Request a fresh magic link below. Open only the newest email, in this same browser (not Gmail’s in-app browser).',
    };
  }
  return { title: 'Sign-in failed', detail: message };
}
