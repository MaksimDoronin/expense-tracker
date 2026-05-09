import type { Category, Transaction } from '@expense-tracker/shared';
import { cn } from '@/shared/lib/utils';
import { formatAmount, formatDate } from '@/features/transactions/model/format';

interface Props {
  transaction: Transaction;
  category?: Category;
}

export function TransactionListItem({ transaction, category }: Props) {
  const isIncome = transaction.type === 'income';
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
          style={{ backgroundColor: category?.color ?? '#e5e7eb' }}
          aria-hidden
        >
          {category?.icon ?? '•'}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">
            {category?.name ?? 'Без категории'}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {transaction.description ?? formatDate(transaction.date)}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div
          className={cn(
            'text-sm font-semibold tabular-nums',
            isIncome ? 'text-emerald-600' : 'text-rose-600',
          )}
        >
          {formatAmount(transaction.amount, transaction.type)}
        </div>
        <div className="text-xs text-muted-foreground">{formatDate(transaction.date)}</div>
      </div>
    </div>
  );
}
