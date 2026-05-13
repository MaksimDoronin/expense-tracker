'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Category } from '@expense-tracker/shared';
import { categoriesApi } from '@/features/categories/api/categories.api';

/**
 * Хук для получения категорий пользователя в виде `Map<id, Category>`.
 * Используется там, где категории нужны только для быстрого поиска по id
 * (например, при отображении транзакций). При ошибке загрузки возвращает пустую Map.
 *
 * @returns Объект с:
 *  - `categories` — `Map<string, Category>`, построенная из массива категорий;
 *  - `isLoading` — `true` пока идёт запрос.
 */
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
