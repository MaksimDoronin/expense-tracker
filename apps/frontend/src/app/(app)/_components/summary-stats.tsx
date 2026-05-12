import { ArrowDownLeft, ArrowUpRight, HelpCircle, Wallet, type LucideIcon } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';

type Tone = 'success' | 'danger' | 'neutral';

interface StatItem {
  key: string;
  label: string;
  value: string;
  hint: string;
  Icon: LucideIcon;
  tone: Tone;
}

const items: StatItem[] = [
  {
    key: 'income',
    label: 'Доходы',
    value: '—',
    hint: 'поступления за месяц',
    Icon: ArrowDownLeft,
    tone: 'success',
  },
  {
    key: 'expense',
    label: 'Расходы',
    value: '—',
    hint: 'траты за месяц',
    Icon: ArrowUpRight,
    tone: 'danger',
  },
  {
    key: 'balance',
    label: 'Баланс',
    value: '—',
    hint: 'доходы минус расходы',
    Icon: Wallet,
    tone: 'neutral',
  },
];

const chipTone: Record<Tone, string> = {
  success: 'bg-success-soft text-success-soft-foreground',
  danger: 'bg-danger-soft text-danger-soft-foreground',
  neutral: 'bg-muted text-muted-foreground',
};

export function SummaryStats() {
  return (
    <div className="reveal space-y-4" style={{ animationDelay: '70ms' }}>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold tracking-tight">Обзор</h2>
        <span className="text-muted-foreground text-sm font-medium">Текущий месяц</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(({ key, label, value, hint, Icon, tone }) => (
          <Card
            key={key}
            className="relative flex flex-col gap-6 p-7 transition-all duration-[600ms] ease-in-out will-change-transform hover:-translate-y-2 hover:shadow-[var(--shadow-pop)]"
          >
            <span className={cn('grid size-12 place-items-center rounded-full', chipTone[tone])}>
              <Icon className="size-5" strokeWidth={2} />
            </span>
            <div className="space-y-2.5">
              <div className="text-muted-foreground flex items-center gap-1.5 text-[15px] font-semibold">
                {label}
                <HelpCircle className="text-muted-foreground/40 size-4" />
              </div>
              <div className="flex items-baseline gap-1.5">
                {value !== '—' && (
                  <span className="text-muted-foreground/40 text-2xl font-bold">₽</span>
                )}
                <span className="text-foreground text-[44px] leading-none font-extrabold tracking-tight tabular-nums">
                  {value}
                </span>
              </div>
              <p className="text-muted-foreground/80 text-sm">{hint}</p>
            </div>
            {key === 'income' && (
              <svg
                className="text-success/70 pointer-events-none absolute top-7 right-6 h-10 w-24"
                viewBox="0 0 80 36"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2 28 C 10 29, 14 31, 20 22 S 30 3, 38 6 S 48 19, 56 16 S 68 6, 78 13"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
