'use client';

import { Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@expense-tracker/shared';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

/** Пропсы компонента `CategoriesList`. */
interface Props {
  /** Массив категорий для отображения. */
  items: Category[];
  /** При `true` отображаются скелетоны вместо содержимого. */
  isLoading: boolean;
  /** Текст ошибки загрузки; при наличии отображается вместо списка. */
  error: string | null;
  /** Вызывается при клике «Редактировать» для конкретной категории. */
  onEdit: (category: Category) => void;
  /** Вызывается при клике «Удалить» для конкретной категории. */
  onDelete: (category: Category) => void;
}

/**
 * Список категорий пользователя с кнопками редактирования и удаления.
 * Обрабатывает три состояния: загрузка (скелетоны), ошибка, пустой список.
 *
 * @param props.items - Массив категорий для отображения.
 * @param props.isLoading - При `true` отображает скелетоны.
 * @param props.error - При наличии отображает сообщение об ошибке.
 * @param props.onEdit - Колбэк при клике кнопки редактирования.
 * @param props.onDelete - Колбэк при клике кнопки удаления.
 * @returns JSX: список категорий, скелетоны, ошибка или пустой стейт.
 */
export function CategoriesList({ items, isLoading, error, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {['sk-0', 'sk-1', 'sk-2', 'sk-3'].map((key) => (
          <Skeleton key={key} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="bg-danger-soft text-danger-soft-foreground rounded-2xl px-4 py-3 text-sm font-medium">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Категорий пока нет. Создайте первую!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((cat, i) => (
        <div
          key={cat.id}
          className="reveal border-border bg-card flex items-center gap-4 rounded-2xl border px-4 py-3.5 shadow-sm"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <span
            className="grid size-10 shrink-0 place-items-center rounded-xl text-xl"
            style={{ backgroundColor: cat.color + '26' }}
          >
            {cat.icon}
          </span>
          <span className="text-foreground flex-1 text-[15px] font-semibold">{cat.name}</span>
          <span
            className="size-4 shrink-0 rounded-full"
            style={{ backgroundColor: cat.color }}
            title={cat.color}
          />
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(cat)}
              aria-label="Редактировать"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(cat)}
              aria-label="Удалить"
              className="text-danger hover:text-danger"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
