import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { safeAuthRedirect } from '@/lib/auth-utils';
import {
  createSupabaseRouteHandlerClient,
  redirectWithSessionCookies,
} from '@/lib/supabase/route-handler';
import { supabaseServiceRole } from '@/lib/supabase/server';

function authErrorRedirect(origin: string, message: string) {
  return NextResponse.redirect(
    new URL(`/sign-in?error=${encodeURIComponent(message)}`, origin),
  );
}

async function resolvePostAuthPath(userId: string, next: string): Promise<string> {
  if (next !== '/dashboard') return next;

  const sb = supabaseServiceRole();
  const { count } = await sb
    .from('search_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (!count || count === 0) return '/onboarding';
  return next;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const next = safeAuthRedirect(
    url.searchParams.get('next') || url.searchParams.get('redirect'),
    '/dashboard',
  );

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
      'Invalid or expired sign-in link. Request a new link and open it in the same browser you used to sign up.',
    );
  }

  const { supabase, response: sessionResponse } = createSupabaseRouteHandlerClient(req);

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

  const redirectPath = await resolvePostAuthPath(userId, next);

  return redirectWithSessionCookies(
    new URL(redirectPath, url.origin),
    sessionResponse(),
  );
}
