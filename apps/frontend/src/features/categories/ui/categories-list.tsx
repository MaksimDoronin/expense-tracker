'use client';

import { Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@expense-tracker/shared';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

interface Props {
  items: Category[];
  isLoading: boolean;
  error: string | null;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoriesList({ items, isLoading, error, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
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
