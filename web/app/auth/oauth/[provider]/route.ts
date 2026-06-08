import { NextRequest, NextResponse } from 'next/server';
import { safeAuthRedirect } from '@/lib/auth-utils';
import {
  createSupabaseRouteClient,
  getAppOrigin,
  redirectWithCookies,
  setAuthNextCookie,
} from '@/lib/supabase/route-client';

const PROVIDERS = new Set(['google', 'github']);

function signInErrorRedirect(req: NextRequest, message: string) {
  return NextResponse.redirect(
    new URL(`/sign-in?error=${encodeURIComponent(message)}`, req.url),
  );
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!PROVIDERS.has(provider)) {
    return signInErrorRedirect(req, 'Invalid sign-in provider.');
  }

  const next = safeAuthRedirect(req.nextUrl.searchParams.get('next'));
  const redirectTo = `${getAppOrigin(req)}/auth/callback`;

  const { supabase, response } = createSupabaseRouteClient(req);
  setAuthNextCookie(response(), next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as 'google' | 'github',
    options: { redirectTo },
  });

  if (error) return signInErrorRedirect(req, error.message);
  if (!data.url) return signInErrorRedirect(req, 'OAuth provider did not return a sign-in URL.');

  return redirectWithCookies(data.url, response());
}
