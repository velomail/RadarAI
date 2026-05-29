import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

function authErrorMessage(request: NextRequest): string | null {
  const description = request.nextUrl.searchParams.get('error_description');
  const code = request.nextUrl.searchParams.get('error_code');
  const error = request.nextUrl.searchParams.get('error');
  if (!description && !code && !error) return null;
  return description || code || error;
}

/** Supabase redirects to Site URL (/) with ?error= when OAuth or auth fails. */
function redirectAuthErrorToSignIn(request: NextRequest) {
  const message = authErrorMessage(request);
  if (!message) return null;

  const path = request.nextUrl.pathname;
  if (path === '/sign-in' || path === '/sign-up') return null;

  const url = request.nextUrl.clone();
  url.pathname = '/sign-in';
  url.search = '';
  url.searchParams.set('error', message);
  return Response.redirect(url);
}

/** Supabase sometimes redirects to Site URL (/) with ?code= instead of /auth/callback. */
function redirectAuthCodeToCallback(request: NextRequest) {
  if (request.nextUrl.pathname === '/auth/callback') return null;

  const code = request.nextUrl.searchParams.get('code');
  const token_hash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');

  if (!code && !(token_hash && type)) return null;

  const url = request.nextUrl.clone();
  url.pathname = '/auth/callback';
  return Response.redirect(url);
}

export async function middleware(request: NextRequest) {
  const errorRedirect = redirectAuthErrorToSignIn(request);
  if (errorRedirect) return errorRedirect;

  const authRedirect = redirectAuthCodeToCallback(request);
  if (authRedirect) return authRedirect;

  return updateSession(request);
}

export const config = {
  // Skip cron routes (no session to refresh) and static assets.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
