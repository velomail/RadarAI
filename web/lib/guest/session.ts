import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export const GUEST_SESSION_COOKIE = 'radar_guest_session';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidSessionId(value: string | undefined): value is string {
  return !!value && UUID_RE.test(value);
}

export async function getGuestSessionId(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(GUEST_SESSION_COOKIE)?.value;
  return isValidSessionId(value) ? value : null;
}

/**
 * Returns existing guest session or creates one and sets an HTTP-only cookie.
 * Only call from Server Actions or Route Handlers — not from Server Components.
 */
export async function getOrCreateGuestSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(GUEST_SESSION_COOKIE)?.value;
  if (isValidSessionId(existing)) return existing;

  const id = randomUUID();
  jar.set(GUEST_SESSION_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return id;
}
