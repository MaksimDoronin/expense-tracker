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
    <div className="hover:bg-muted/70 flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors">
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-[13px] text-[15px] ring-1 ring-black/[0.06]"
          style={{ backgroundColor: category?.color ?? 'oklch(0.93 0.002 106)' }}
          aria-hidden
        >
          {category?.icon ?? '•'}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[15px] leading-tight font-semibold">
            {category?.name ?? 'Без категории'}
          </div>
          <div className="text-muted-foreground truncate text-[12.5px]">
            {transaction.description || formatDate(transaction.date)}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <div
          className={cn(
            'text-[15px] font-bold tabular-nums',
            isIncome ? 'text-success' : 'text-foreground',
          )}
        >
          {formatAmount(transaction.amount, transaction.type)}
        </div>
        {transaction.description && (
          <div className="text-muted-foreground text-[12px]">{formatDate(transaction.date)}</div>
        )}
      </div>
    </div>
  );
}
