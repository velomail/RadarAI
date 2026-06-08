import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'fresh' | 'warm' | 'recent' | 'stale' | 'success' | 'muted';

const variants: Record<Variant, string> = {
  default: 'border border-border bg-muted text-foreground',
  fresh: 'border border-border bg-muted text-foreground',
  warm: 'border border-border bg-muted text-foreground',
  recent: 'border border-border bg-muted text-muted-foreground',
  stale: 'border border-border bg-muted text-muted-foreground',
  success: 'border border-border bg-muted text-foreground',
  muted: 'border border-border bg-muted text-muted-foreground',
};

export function Badge({
  variant = 'default',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
