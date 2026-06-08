import { NextResponse } from 'next/server';

/** Fail closed in production when CRON_SECRET is missing. */
export function verifyCronAuth(authHeader: string | null): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  if (!secret) {
    if (isProd) {
      return NextResponse.json({ error: 'cron_secret_not_configured' }, { status: 503 });
    }
    return null;
  }

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return null;
}
