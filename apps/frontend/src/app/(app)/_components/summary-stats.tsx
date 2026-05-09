import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';

const items = [
  { label: 'Доходы', value: '0 ₽', tone: 'text-emerald-600' },
  { label: 'Расходы', value: '0 ₽', tone: 'text-rose-600' },
  { label: 'Баланс', value: '0 ₽', tone: 'text-foreground' },
];

export function SummaryStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex flex-col gap-1 p-4">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {item.label}
            </span>
            <span className={cn('text-2xl font-semibold tabular-nums', item.tone)}>
              {item.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
