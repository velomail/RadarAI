import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'fresh' | 'warm' | 'recent' | 'stale' | 'success' | 'muted';

const variants: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground',
  fresh: 'bg-[hsl(var(--danger))] text-white',
  warm: 'bg-[hsl(var(--warning))] text-white',
  recent: 'bg-muted text-muted-foreground',
  stale: 'bg-muted text-muted-foreground',
  success: 'bg-[hsl(var(--success))] text-white',
  muted: 'bg-muted text-muted-foreground',
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
