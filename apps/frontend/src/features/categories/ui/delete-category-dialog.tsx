'use client';

import { useState } from 'react';
import type { Category } from '@expense-tracker/shared';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { categoriesApi } from '@/features/categories/api/categories.api';

interface Props {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  category: Category | null;
}

export function DeleteCategoryDialog({ open, onClose, onDeleted, category }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!category) return;
    setError(null);
    setIsDeleting(true);
    try {
      await categoriesApi.remove(category.id);
      onDeleted();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg.toLowerCase().includes('restrict') ||
          msg.includes('транзакц') ||
          msg.includes('P2003') ||
          msg.includes('409')
          ? 'Нельзя удалить категорию, у которой есть транзакции.'
          : msg || 'Не удалось удалить категорию.',
      );
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
