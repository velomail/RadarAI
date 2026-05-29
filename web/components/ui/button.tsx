import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'outline' | 'ghost' | 'danger';
type Size = 'default' | 'sm' | 'lg';

const variants: Record<Variant, string> = {
  default:
    'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50',
  outline:
    'border border-border bg-transparent hover:bg-accent disabled:opacity-50',
  ghost: 'bg-transparent hover:bg-accent disabled:opacity-50',
  danger:
    'bg-[hsl(var(--danger))] text-white hover:opacity-90 disabled:opacity-50',
};

const sizes: Record<Size, string> = {
  default: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-11 px-6 text-base',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
