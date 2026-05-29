import Link from 'next/link';
import { Radar } from 'lucide-react';
import { MockModeBanner } from '@/components/layout/MockModeBanner';
import { APP_NAME } from '@/lib/brand';

export function ProductShell({
  children,
  cta,
  maxWidth = '5xl',
}: {
  children: React.ReactNode;
  cta?: { href: string; label: string };
  maxWidth?: '4xl' | '5xl';
}) {
  const widthClass = maxWidth === '4xl' ? 'max-w-4xl' : 'max-w-5xl';

  return (
    <div className="gradient-mesh flex min-h-screen flex-col">
      <MockModeBanner />
      <header className="border-b border-border/50">
        <div className={`mx-auto flex ${widthClass} items-center justify-between px-6 py-4`}>
          <Link href="/" className="group flex items-center gap-2 text-lg font-semibold tracking-tight">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg transition-colors group-hover:bg-primary/30" />
              <Radar className="relative h-6 w-6 text-primary" />
            </div>
            <span>{APP_NAME}</span>
          </Link>
          {cta ? (
            <Link href={cta.href} className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
              {cta.label}
            </Link>
          ) : null}
        </div>
      </header>
      <main className={`relative mx-auto w-full ${widthClass} flex-1 px-6 py-8 md:py-10`}>{children}</main>
    </div>
  );
}
