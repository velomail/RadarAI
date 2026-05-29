'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SEARCH_PAGE } from '@/lib/constants';
import { cn } from '@/lib/utils';

const links = [
  {
    href: SEARCH_PAGE,
    label: 'Search',
    match: (p: string) =>
      p === SEARCH_PAGE || p === '/dashboard' || p.startsWith('/dashboard/runs'),
  },
  { href: '/dashboard/settings', label: 'Settings', match: (p: string) => p.startsWith('/dashboard/settings') },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 text-sm">
      {links.map(({ href, label, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'transition-colors',
              active ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
