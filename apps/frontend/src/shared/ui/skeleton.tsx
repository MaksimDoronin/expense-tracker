import * as React from 'react';
import { cn } from '@/shared/lib/utils';

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('bg-muted animate-pulse rounded-xl', className)} {...props} />
  ),
);
Skeleton.displayName = 'Skeleton';

export { Skeleton };
