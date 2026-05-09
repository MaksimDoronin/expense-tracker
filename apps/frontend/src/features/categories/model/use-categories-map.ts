'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Category } from '@expense-tracker/shared';
import { categoriesApi } from '@/features/categories/api/categories.api';

export function useCategoriesMap() {
  const [items, setItems] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    categoriesApi
      .list()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => new Map(items.map((c) => [c.id, c])), [items]);
  return { categories, isLoading };
}
