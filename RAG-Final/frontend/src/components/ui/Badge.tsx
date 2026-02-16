import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const text = typeof children === 'string' ? children.toUpperCase() : '';
  const tone =
    text.includes('DONE') || text.includes('INDEXED')
      ? 'bg-accent/20 text-accent border-accent/30'
      : text.includes('FAILED')
        ? 'bg-red-500/20 text-red-300 border-red-500/40'
        : text.includes('RUNNING') || text.includes('PROCESSING')
          ? 'bg-orange/20 text-orange border-orange/30'
          : 'bg-header text-muted border-border';

  return (
    <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-semibold', tone, className)} {...props}>
      {children}
    </span>
  );
}
