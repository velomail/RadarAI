import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SEARCH_PAGE } from '@/lib/constants';
import { FREE_DAILY_QUERY_LIMIT } from '@/lib/usage/constants';

const signUpHref = `/sign-up?redirect=${encodeURIComponent(SEARCH_PAGE)}`;
const signInHref = `/sign-in?redirect=${encodeURIComponent(SEARCH_PAGE)}`;

type Props = {
  variant?: 'banner' | 'inline';
};

export function GuestSignUpPrompt({ variant = 'banner' }: Props) {
  if (variant === 'inline') {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href={signUpHref} className="font-medium text-foreground underline">
          Create a free account
        </Link>{' '}
        for {FREE_DAILY_QUERY_LIMIT} searches per day and full ranked results.
      </p>
    );
  }

  return (
    <div className="surface w-full rounded-lg p-7 lg:p-9 xl:p-10">
      <h3 className="text-lg font-semibold tracking-tight lg:text-xl xl:text-2xl">Want more matches?</h3>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground lg:text-lg">
        Free accounts get {FREE_DAILY_QUERY_LIMIT} resume-aware searches per day with full ranked
        lists, saved criteria, and match details. Pro plans with higher limits are coming soon.
      </p>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <Link href={signUpHref} className="shrink-0">
          <Button size="lg" className="h-12 w-full px-8 text-base sm:w-auto">
            Create free account
          </Button>
        </Link>
        <Link
          href={signInHref}
          className="inline-flex min-h-12 items-center justify-center px-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground sm:justify-start sm:px-1"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
