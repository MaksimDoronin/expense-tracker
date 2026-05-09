import { TransactionType } from '@prisma/client';

export interface PublicTransaction {
  id: string;
  amount: string;
  type: TransactionType;
  description: string | null;
  date: Date;
  categoryId: string;
  userId: string;
  createdAt: Date;
}

export interface TransactionSummary {
  month: number;
  year: number;
  totalIncome: string;
  totalExpense: string;
  balance: string;
  byCategory: Array<{ categoryId: string; type: TransactionType; total: string }>;
}
