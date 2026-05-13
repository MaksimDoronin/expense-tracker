'use client';

import { useEffect, useState } from 'react';
import type { Category } from '@expense-tracker/shared';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/lib/utils';
import { ApiError } from '@/shared/api/client';
import { categoriesApi } from '@/features/categories/api/categories.api';
import { ICON_PRESETS, COLOR_PRESETS } from '@/features/categories/model/presets';

/** Пропсы компонента `CategoryFormDialog`. */
interface Props {
  /** Управляет видимостью диалога. */
  open: boolean;
  /** Вызывается при закрытии диалога без сохранения. */
  onClose: () => void;
  /** Вызывается после успешного создания или обновления категории. */
  onSaved: () => void;
  /** Категория для редактирования; если не передана — диалог работает в режиме создания. */
  category?: Category;
}

/**
 * Диалог создания или редактирования категории.
 * Режим определяется наличием пропа `category`: передан — редактирование, не передан — создание.
 *
 * @param props.open - Управляет видимостью диалога.
 * @param props.onClose - Вызывается при закрытии без сохранения.
 * @param props.onSaved - Вызывается после успешного сохранения.
 * @param props.category - Категория для редактирования; `undefined` — режим создания.
 */
export function CategoryFormDialog({ open, onClose, onSaved, category }: Props) {
  const isEdit = !!category;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICON_PRESETS[0] ?? '🍔');
  const [color, setColor] = useState(COLOR_PRESETS[0] ?? '#6366f1');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? '');
    setIcon(category?.icon ?? (ICON_PRESETS[0] ?? '🍔'));
    setColor(category?.color ?? (COLOR_PRESETS[0] ?? '#6366f1'));
    setError(null);
    setIsSubmitting(false);
  }, [open, category]);

  /**
   * Обработчик отправки формы: валидирует имя, вызывает API и обновляет состояние.
   *
   * @param e - Событие отправки формы.
   * @returns Промис.
   * @throws {ApiError} Перехватывается внутри: 409 → ошибка занятого имени, прочее → общее сообщение.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Введите название категории.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      if (isEdit && category) {
        await categoriesApi.update(category.id, { name: trimmed, icon, color });
      } else {
        await categoriesApi.create({ name: trimmed, icon, color });
      }
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Категория с таким именем уже существует.');
      } else {
        setError(err instanceof Error ? err.message : 'Не удалось сохранить категорию.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Редактировать категорию' : 'Новая категория'}
      description={isEdit ? 'Измените название, иконку или цвет.' : 'Задайте название, иконку и цвет.'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cat-name">Название</Label>
          <Input
            id="cat-name"
            type="text"
            maxLength={60}
            placeholder="Например: Продукты"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Иконка</Label>
          <div className="grid grid-cols-5 gap-2">
            {ICON_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={cn(
                  'flex h-10 w-full items-center justify-center rounded-xl border text-xl transition-all duration-100',
                  icon === emoji
                    ? 'border-ring bg-accent shadow-sm scale-105'
                    : 'border-border bg-card hover:bg-accent',
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Цвет</Label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setColor(hex)}
                style={{ backgroundColor: hex }}
                className={cn(
                  'size-8 rounded-full transition-all duration-100',
                  color === hex
                    ? 'scale-110 ring-2 ring-ring ring-offset-2 ring-offset-card'
                    : 'opacity-80 hover:opacity-100',
                )}
                aria-label={hex}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="bg-danger-soft text-danger-soft-foreground rounded-xl px-3.5 py-2.5 text-[13px] font-medium">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
