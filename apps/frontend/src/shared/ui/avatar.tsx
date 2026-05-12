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
        'from-foreground via-foreground to-foreground/65 text-panel flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[13px] font-bold tracking-wide uppercase ring-1 ring-black/10',
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
