'use client';

import { useCategoriesMap } from '@/features/categories/model/use-categories-map';
import { RecentTransactions } from '@/features/transactions/ui/recent-transactions';
import { PageHeader } from '../_components/page-header';

export default function TransactionsPage() {
  const { categories } = useCategoriesMap();

  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="Транзакции" description="История доходов и расходов." />
      <div className="reveal" style={{ animationDelay: '70ms' }}>
        <RecentTransactions categories={categories} />
      </div>
    </div>
  );
}
