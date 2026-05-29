'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
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
        className={`h-11 rounded-xl px-6 ${fullWidth ? 'w-full justify-center text-base' : ''}`}
        disabled={pending || limitHit}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            setLimitHit(false);
            const res = await fetch(`/api/profiles/${profileId}/run`, { method: 'POST' });
            if (res.status === 429) {
              setLimitHit(true);
              setError('Daily search limit reached (3 per day on the free plan).');
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
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {error && !limitHit ? (
        <p className="text-sm text-[hsl(var(--danger))]">{error}</p>
      ) : null}

      {limitHit ? (
        <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">You&apos;ve used all 3 free searches today</p>
          <p className="mt-1 text-muted-foreground">
            Resets at midnight UTC.{' '}
            <Link href="/support" className="font-medium text-primary hover:underline">
              Contact us
            </Link>{' '}
            or upgrade when RadarAI Pro launches.
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Pro — unlimited searches &amp; scheduled digests (coming soon)
          </p>
        </div>
      ) : null}
    </div>
  );
}
