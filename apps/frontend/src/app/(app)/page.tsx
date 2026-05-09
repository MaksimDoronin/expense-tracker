'use client';

import { useCategoriesMap } from '@/features/categories/model/use-categories-map';
import { RecentTransactions } from '@/features/transactions/ui/recent-transactions';
import { SummaryStats } from './_components/summary-stats';

export default function DashboardPage() {
  const { categories } = useCategoriesMap();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Главная</h1>
        <p className="text-sm text-muted-foreground">Краткий обзор последних операций.</p>
      </header>
      <SummaryStats />
      <RecentTransactions categories={categories} />
    </div>
  );
}
