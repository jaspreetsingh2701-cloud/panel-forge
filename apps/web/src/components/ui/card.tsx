import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & { as?: 'div' | 'section' | 'article' };

export function Card({ as: Element = 'div', className = '', ...props }: CardProps) {
  return <Element className={`pf-card ${className}`.trim()} {...props} />;
}
