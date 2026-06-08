import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const AUTH_NEXT_COOKIE = 'radar-auth-next';

/** Route-handler Supabase client; cookies are written onto `response` for redirects. */
export function createSupabaseRouteClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  return { supabase, response: () => response };
}

export function redirectWithCookies(target: URL | string, sessionResponse: NextResponse) {
  const redirect = NextResponse.redirect(target);
  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}

export function setAuthNextCookie(response: NextResponse, next: string) {
  response.cookies.set(AUTH_NEXT_COOKIE, next, {
    path: '/',
    maxAge: 60 * 10,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
}

export function readAuthNextCookie(request: NextRequest, fallback: string) {
  return request.cookies.get(AUTH_NEXT_COOKIE)?.value ?? fallback;
}

export function clearAuthNextCookie(response: NextResponse) {
  response.cookies.set(AUTH_NEXT_COOKIE, '', { path: '/', maxAge: 0 });
}

/** Canonical app origin for OAuth callbacks (env wins over request host). */
export function getAppOrigin(request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  return request.nextUrl.origin;
}
