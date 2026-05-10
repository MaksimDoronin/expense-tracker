'use client';

import { useEffect, useState } from 'react';
import type { Category, TransactionType } from '@expense-tracker/shared';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/lib/utils';
import { transactionsApi } from '@/features/transactions/api/transactions.api';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  categories: Category[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function CreateTransactionDialog({ open, onClose, onCreated, categories }: Props) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(todayIso());
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    setType('expense');
    setAmount('');
    setDate(todayIso());
    setCategoryId(categories[0]?.id ?? '');
    setDescription('');
    setError(null);
    setIsSubmitting(false);
  }, [open, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = Number(amount.replace(',', '.'));
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError('Введите положительную сумму.');
      return;
    }
    if (!categoryId) {
      setError('Выберите категорию.');
      return;
    }

    setIsSubmitting(true);
    try {
      await transactionsApi.create({
        amount: Math.round(amountNum * 100) / 100,
        type,
        date: new Date(`${date}T00:00:00`).toISOString(),
        categoryId,
        description: description.trim() || undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать транзакцию');
    } finally {
      setIsSubmitting(false);
    }
  };

  const noCategories = categories.length === 0;

  return (
    <Dialog open={open} onClose={onClose} title="Новая транзакция">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {noCategories && (
          <p className="text-sm text-destructive">
            Сначала создайте хотя бы одну категорию.
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                type === t
                  ? t === 'income'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-rose-600 bg-rose-50 text-rose-700'
                  : 'border-border bg-background text-muted-foreground hover:bg-accent',
              )}
            >
              {t === 'income' ? 'Доход' : 'Расход'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Сумма</Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Категория</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={noCategories}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            {noCategories && <option value="">Категорий нет</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Дата</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Описание (опционально)</Label>
          <Input
            id="description"
            type="text"
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting || noCategories}>
            {isSubmitting ? 'Сохранение…' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
