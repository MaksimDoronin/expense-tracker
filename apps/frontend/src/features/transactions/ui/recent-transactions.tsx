'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
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
        <CardTitle>Последние транзакции</CardTitle>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : visibleItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Транзакций пока нет.</p>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {visibleItems.map((tx) => (
                <li key={tx.id}>
                  <TransactionListItem transaction={tx} category={map.get(tx.categoryId)} />
                </li>
              ))}
            </ul>
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={loadMore}>
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
