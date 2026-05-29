'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Supabase sometimes puts auth errors in the URL hash (#error=...) which the server never sees.
 */
export function AuthHashRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const raw = window.location.hash?.replace(/^#/, '') ?? '';
    if (!raw) return;

    const params = new URLSearchParams(raw);
    const error =
      params.get('error_description') ||
      params.get('error_code') ||
      params.get('error');
    if (!error) return;

    const base = pathname.startsWith('/sign-up') ? '/sign-up' : '/sign-in';
    router.replace(`${base}?error=${encodeURIComponent(error)}`);
    window.history.replaceState(null, '', base);
  }, [pathname, router]);

  return null;
}
