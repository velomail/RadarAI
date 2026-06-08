'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SEARCH_PAGE } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export function RunNowButton({
  profileId,
  fullWidth = false,
  label = 'Search now',
}: {
  profileId: string;
  fullWidth?: boolean;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);

  return (
    <div className={`flex flex-col gap-3 ${fullWidth ? 'w-full' : ''}`}>
      <Button
        size="lg"
        className={`h-11 px-6 ${fullWidth ? 'w-full justify-center text-base' : ''}`}
        disabled={pending || limitHit}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            setLimitHit(false);
            const res = await fetch(`/api/profiles/${profileId}/run`, { method: 'POST' });
            if (res.status === 429) {
              setLimitHit(true);
              setError('Daily search limit reached (5 per day).');
              return;
            }
            if (res.status !== 202 && !res.ok) {
              const body = await res.json().catch(() => ({}));
              setError(body.error || `HTTP ${res.status}`);
              return;
            }
            const { run_id } = await res.json();
            router.replace(`${SEARCH_PAGE}?run=${run_id}`);
          })
        }
      >
        {pending ? 'Starting search…' : label}
      </Button>

      {error && !limitHit ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : null}

      {limitHit ? (
        <div className="border border-border px-4 py-3 text-sm">
          <p className="font-medium">You&apos;ve used all 5 searches today</p>
          <p className="mt-1 text-muted-foreground">
            Resets at midnight UTC.{' '}
            <Link href="/support" className="font-medium text-foreground underline">
              Contact us
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
