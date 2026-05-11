import { Prisma, TransactionType } from '@prisma/client';
import { PublicTransaction } from './domain/transaction.entity';

/** Набор полей Prisma, выбираемых при каждом запросе транзакции. Единственный источник истины для проекции. */
export const transactionSelect = {
  id: true,
  amount: true,
  type: true,
  description: true,
  date: true,
  categoryId: true,
  userId: true,
  createdAt: true,
} satisfies Prisma.TransactionSelect;

type TransactionRow = {
  id: string;
  amount: Prisma.Decimal;
  type: TransactionType;
  description: string | null;
  date: Date;
  categoryId: string;
  userId: string;
  createdAt: Date;
};

/**
 * Преобразует строку Prisma в публичный DTO транзакции.
 * Конвертирует `Prisma.Decimal` → `string`, чтобы избежать потери точности при сериализации в JSON.
 *
 * @param row - Запись из БД, выбранная через `transactionSelect`.
 * @returns Объект `PublicTransaction` с `amount` в виде строки.
 */
export function toPublicTransaction(row: TransactionRow): PublicTransaction {
  return { ...row, amount: row.amount.toString() };
}
