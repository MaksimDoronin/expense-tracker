'use client';

import { useCategoriesMap } from '@/features/categories/model/use-categories-map';
import { RecentTransactions } from '@/features/transactions/ui/recent-transactions';
import { PageHeader } from './_components/page-header';
import { SummaryStats } from './_components/summary-stats';

export default function DashboardPage() {
  const { categories } = useCategoriesMap();

  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="Главная" description="Краткий обзор последних операций." />
      <SummaryStats />
      <div className="reveal" style={{ animationDelay: '140ms' }}>
        <RecentTransactions categories={categories} />
      </div>
    </div>
  );
}
