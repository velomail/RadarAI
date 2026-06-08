import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { safeAuthRedirect } from '@/lib/auth-utils';
import { SEARCH_PAGE } from '@/lib/constants';
import {
  clearAuthNextCookie,
  createSupabaseRouteClient,
  readAuthNextCookie,
  redirectWithCookies,
} from '@/lib/supabase/route-client';

function authErrorRedirect(origin: string, message: string) {
  return NextResponse.redirect(
    new URL(`/sign-in?error=${encodeURIComponent(message)}`, origin),
  );
}

function resolvePostAuthPath(next: string): string {
  if (next !== SEARCH_PAGE && next !== '/dashboard') return next;
  return SEARCH_PAGE;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;

  const oauthError = url.searchParams.get('error');
  const oauthDescription = url.searchParams.get('error_description');
  if (oauthError) {
    return authErrorRedirect(url.origin, oauthDescription || oauthError);
  }

  const code = url.searchParams.get('code');
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;

  if (!code && !(token_hash && type)) {
    return authErrorRedirect(
      url.origin,
      'Invalid or expired sign-in session. Try signing in again with Google or GitHub.',
    );
  }

  const next = safeAuthRedirect(readAuthNextCookie(req, SEARCH_PAGE), SEARCH_PAGE);
  const { supabase, response } = createSupabaseRouteClient(req);

  let userId: string | undefined;

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) return authErrorRedirect(url.origin, error.message);
    userId = data.user?.id;
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return authErrorRedirect(url.origin, error.message);
    userId = data.user?.id;
  }

  if (!userId) {
    return authErrorRedirect(url.origin, 'Sign-in succeeded but no user session was created.');
  }

  const sessionResponse = response();
  clearAuthNextCookie(sessionResponse);

  return redirectWithCookies(
    new URL(resolvePostAuthPath(next), url.origin),
    sessionResponse,
  );
}
