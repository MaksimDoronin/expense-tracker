import * as React from 'react';
import { cn } from '@/shared/lib/utils';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground',
        className,
      )}
      aria-label={name}
      {...props}
    >
      {getInitials(name)}
    </div>
  ),
);
Avatar.displayName = 'Avatar';

export { Avatar };
