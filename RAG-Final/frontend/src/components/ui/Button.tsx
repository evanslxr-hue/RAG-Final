import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className, variant = 'primary', ...props }: Props) {
  const variants: Record<Variant, string> = {
    primary: 'bg-accent text-bg hover:opacity-90',
    secondary: 'border border-border bg-transparent text-white hover:bg-header',
    ghost: 'bg-transparent text-muted hover:text-white hover:bg-header'
  };

  return (
    <button
      className={cn(
        'rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
