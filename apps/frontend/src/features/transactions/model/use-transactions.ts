'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Transaction } from '@expense-tracker/shared';
import { transactionsApi } from '@/features/transactions/api/transactions.api';

const PAGE_SIZE = 10;

export function useTransactions() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    transactionsApi
      .list()
      .then((data) => {
        if (cancelled) return;
        const sorted = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setItems(sorted);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Не удалось загрузить транзакции');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + PAGE_SIZE);
  }, []);

  const refresh = useCallback(() => {
    setVisibleCount(PAGE_SIZE);
    setReloadKey((k) => k + 1);
  }, []);

  return { items, visibleItems, hasMore, loadMore, isLoading, error, refresh };
}
