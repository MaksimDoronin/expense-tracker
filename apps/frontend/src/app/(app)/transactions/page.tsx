'use client';

import { useCategoriesMap } from '@/features/categories/model/use-categories-map';
import { RecentTransactions } from '@/features/transactions/ui/recent-transactions';
import { SummaryStats } from '../_components/summary-stats';

export default function TransactionsPage() {
  const { categories } = useCategoriesMap();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Транзакции</h1>
        <p className="text-sm text-muted-foreground">История доходов и расходов.</p>
      </header>
      <SummaryStats />
      <RecentTransactions categories={categories} />
    </div>
  );
}
