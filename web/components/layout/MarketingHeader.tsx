import Link from 'next/link';
import { AppBrandLink } from '@/components/layout/AppBrandLink';
import { Button } from '@/components/ui/button';

type Props = {
  showCta?: boolean;
};

export function MarketingHeader({ showCta = true }: Props) {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="page-container flex h-[4.25rem] items-center justify-between lg:h-[4.5rem]">
        <AppBrandLink size="lg" />
        {showCta ? (
          <Link href="/sign-up">
            <Button size="lg" className="h-11 px-6">
              Get started
            </Button>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
