import type { HTMLAttributes } from 'react';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' };

export function Badge({ tone = 'neutral', className = '', ...props }: BadgeProps) {
  return <span className={`pf-badge pf-badge--${tone} ${className}`.trim()} {...props} />;
}
