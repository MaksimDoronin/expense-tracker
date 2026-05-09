import { Prisma, TransactionType } from '@prisma/client';
import { PublicTransaction } from './domain/transaction.entity';

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

export function toPublicTransaction(row: TransactionRow): PublicTransaction {
  return { ...row, amount: row.amount.toString() };
}
