'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatAuthError } from '@/lib/auth-errors';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  redirectTo: string;
  fromSignUp?: boolean;
};

/** Client-side OTP so PKCE code_verifier is stored in this browser's cookies. */
export function MagicLinkForm({ redirectTo, fromSignUp }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = new FormData(e.currentTarget).get('email')?.toString().trim();
    if (!email) {
      setError('Email is required.');
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({ next: redirectTo });
    // Must match the browser tab where the user requested the link (PKCE cookies).
    const origin = window.location.origin.replace(/\/$/, '');
    const emailRedirectTo = `${origin}/auth/callback?${params}`;

    const { error: authError } = await supabaseBrowser().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        shouldCreateUser: true,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }

    const base = fromSignUp ? '/sign-up' : '/sign-in';
    router.push(`${base}?check=1&email=${encodeURIComponent(email)}`);
  }

  const formatted = error ? formatAuthError(error) : null;

  return (
    <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-4">
      {formatted ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <p className="font-medium">{formatted.title}</p>
          <p className="mt-1 text-destructive/90">{formatted.detail}</p>
        </div>
      ) : null}
      <div>
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 h-12 rounded-xl border-white/40 bg-white/80"
          disabled={loading}
        />
      </div>
      <Button type="submit" size="lg" className="h-12 rounded-xl text-base" disabled={loading}>
        {loading ? 'Sending…' : 'Email me a link →'}
      </Button>
    </form>
  );
}
