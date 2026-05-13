'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Category } from '@expense-tracker/shared';
import { categoriesApi } from '@/features/categories/api/categories.api';

/**
 * Хук для получения и управления списком категорий текущего пользователя.
 * Загружает данные при монтировании и при каждом вызове `refresh()`.
 * Отменяет запрос при размонтировании компонента.
 *
 * @returns Объект с:
 *  - `items` — массив загруженных категорий;
 *  - `isLoading` — `true` пока идёт запрос;
 *  - `error` — сообщение об ошибке или `null`;
 *  - `refresh` — функция для принудительной перезагрузки данных.
 */
export function useCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    categoriesApi
      .list()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Не удалось загрузить категории');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  return { items, isLoading, error, refresh };
}
