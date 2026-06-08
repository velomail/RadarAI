import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-md border border-border bg-transparent px-4 py-2 text-base shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:h-[3.25rem] lg:text-lg',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-[5.5rem] w-full rounded-md border border-border bg-transparent px-4 py-3 text-base shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:min-h-[6.5rem] lg:text-lg',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
