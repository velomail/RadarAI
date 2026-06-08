'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/dashboard/settings', label: 'Account', match: (p: string) => p === '/dashboard/settings' },
  {
    href: '/dashboard/settings/search',
    label: 'Search defaults',
    match: (p: string) => p.startsWith('/dashboard/settings/search'),
  },
  { href: '/privacy', label: 'Privacy', match: () => false },
] as const;

type Props = {
  variant?: 'sidebar' | 'horizontal';
};

export function SettingsNav({ variant = 'sidebar' }: Props) {
  const pathname = usePathname();
  const horizontal = variant === 'horizontal';

  return (
    <nav
      className={cn(
        horizontal
          ? 'flex gap-1 overflow-x-auto px-4 py-2'
          : 'flex flex-col gap-0.5 px-5 py-5',
      )}
    >
      <p
        className={cn(
          'text-xs font-medium uppercase tracking-wide text-muted-foreground',
          horizontal ? 'sr-only' : 'mb-2 px-2.5',
        )}
      >
        Settings
      </p>
      {tabs.map(({ href, label, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
