import Link from 'next/link';
import { APP_NAME } from '@/lib/brand';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  size?: 'default' | 'lg';
  href?: string;
};

export function AppBrandLink({ className, size = 'default', href = '/' }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80',
        size === 'lg' ? 'text-xl lg:text-2xl' : 'text-lg lg:text-xl',
        className,
      )}
    >
      {APP_NAME}
    </Link>
  );
}
