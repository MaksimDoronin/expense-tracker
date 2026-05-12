'use client';

import { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import type { Category } from '@expense-tracker/shared';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useTransactions } from '@/features/transactions/model/use-transactions';
import { CreateTransactionDialog } from './create-transaction-dialog';
import { TransactionListItem } from './transaction-list-item';

interface Props {
  categories?: Map<string, Category>;
}

export function RecentTransactions({ categories }: Props) {
  const { visibleItems, hasMore, loadMore, isLoading, error, refresh } = useTransactions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const map = categories ?? new Map<string, Category>();
  const categoryList = Array.from(map.values());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="space-y-0.5">
          <CardTitle>Последние операции</CardTitle>
          <p className="text-muted-foreground text-[13px]">Доходы и расходы</p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" strokeWidth={2.4} />
          Добавить
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[58px] w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-danger-soft text-danger-soft-foreground rounded-2xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="bg-muted text-muted-foreground grid size-12 place-items-center rounded-2xl">
              <Receipt className="size-5" strokeWidth={1.75} />
            </span>
            <div className="space-y-0.5">
              <p className="text-foreground text-sm font-bold">Пока нет операций</p>
              <p className="text-muted-foreground text-[13px]">
                Добавьте первую транзакцию, чтобы увидеть её здесь.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-0.5">
              {visibleItems.map((tx) => (
                <li key={tx.id}>
                  <TransactionListItem transaction={tx} category={map.get(tx.categoryId)} />
                </li>
              ))}
            </ul>
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" onClick={loadMore}>
                  Загрузить ещё
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CreateTransactionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={refresh}
        categories={categoryList}
      />
    </Card>
  );
}
