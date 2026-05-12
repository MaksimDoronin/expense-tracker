import { Wallet } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface LogoProps {
  className?: string;
  withWordmark?: boolean;
}

export function Logo({ className, withWordmark = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className="from-foreground via-foreground to-foreground/65 text-panel grid size-9 place-items-center rounded-[13px] bg-gradient-to-br shadow-[var(--shadow-pill)] ring-1 ring-black/10"
        aria-hidden
      >
        <Wallet className="size-[18px]" strokeWidth={2} />
      </span>
      {withWordmark && (
        <span className="text-foreground text-[15px] font-extrabold tracking-tight">
          Expense Tracker
        </span>
      )}
    </div>
  );
}
