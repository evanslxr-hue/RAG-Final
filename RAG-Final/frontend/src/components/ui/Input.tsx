import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-border bg-header px-4 py-2 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none',
        className
      )}
      {...props}
    />
  );
}
