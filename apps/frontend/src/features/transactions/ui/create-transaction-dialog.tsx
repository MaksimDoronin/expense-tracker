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
    <Dialog
      open={open}
      onClose={onClose}
      title="Новая транзакция"
      description="Добавьте доход или расход в историю операций."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {noCategories && (
          <p className="bg-danger-soft text-danger-soft-foreground rounded-xl px-3.5 py-2.5 text-[13px] font-medium">
            Сначала создайте хотя бы одну категорию.
          </p>
        )}

        <div className="bg-muted grid grid-cols-2 gap-2 rounded-2xl p-1">
          {(['expense', 'income'] as const).map((t) => {
            const selected = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150',
                  selected
                    ? t === 'income'
                      ? 'bg-card text-success shadow-[var(--shadow-pill)]'
                      : 'bg-card text-foreground shadow-[var(--shadow-pill)]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t === 'income' ? 'Доход' : 'Расход'}
              </button>
            );
          })}
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
            className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/35 h-10 rounded-xl border px-3.5 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
            placeholder="Например: продукты на неделю"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
          <Button type="submit" disabled={isSubmitting || noCategories}>
            {isSubmitting ? 'Сохранение…' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
