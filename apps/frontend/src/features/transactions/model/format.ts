import type { TransactionType } from '@expense-tracker/shared';

const amountFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatAmount(amount: string, type: TransactionType): string {
  const value = amountFormatter.format(Number(amount));
  return `${type === 'income' ? '+' : '−'} ${value} ₽`;
}

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}
