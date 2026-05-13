'use client';

import { useEffect, useState } from 'react';
import type { Category } from '@expense-tracker/shared';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { ApiError } from '@/shared/api/client';
import { categoriesApi } from '@/features/categories/api/categories.api';

/** Пропсы компонента `DeleteCategoryDialog`. */
interface Props {
  /** Управляет видимостью диалога. */
  open: boolean;
  /** Вызывается при отмене удаления. */
  onClose: () => void;
  /** Вызывается после успешного удаления категории. */
  onDeleted: () => void;
  /** Удаляемая категория; `null` означает, что диалог неактивен. */
  category: Category | null;
}

/**
 * Диалог подтверждения удаления категории.
 * Блокирует удаление, если к категории привязаны транзакции (HTTP 409 от сервера).
 *
 * @param props.open - Управляет видимостью диалога.
 * @param props.onClose - Вызывается при отмене удаления.
 * @param props.onDeleted - Вызывается после успешного удаления.
 * @param props.category - Удаляемая категория; `null` — диалог неактивен.
 */
export function DeleteCategoryDialog({ open, onClose, onDeleted, category }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setIsDeleting(false);
  }, [open]);

  /**
   * Отправляет запрос на удаление категории и обновляет состояние.
   *
   * @returns Промис.
   * @throws {ApiError} Перехватывается внутри: 409 → ошибка привязанных транзакций, прочее → общее сообщение.
   */
  const handleDelete = async () => {
    if (!category) return;
    setError(null);
    setIsDeleting(true);
    try {
      await categoriesApi.remove(category.id);
      onDeleted();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Нельзя удалить категорию, у которой есть транзакции.');
      } else {
        setError(err instanceof Error ? err.message : 'Не удалось удалить категорию.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Удалить категорию">
      <div className="flex flex-col gap-5">
        <p className="text-muted-foreground text-sm">
          Вы уверены, что хотите удалить категорию{' '}
          <span className="text-foreground font-semibold">
            {category?.icon} {category?.name}
          </span>
          ? Это действие нельзя отменить.
        </p>

        {error && (
          <p className="bg-danger-soft text-danger-soft-foreground rounded-xl px-3.5 py-2.5 text-[13px] font-medium">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Удаление…' : 'Удалить'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
