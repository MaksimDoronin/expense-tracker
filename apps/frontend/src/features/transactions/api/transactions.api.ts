import { apiRequest } from '@/shared/api/client';
import type { Transaction, TransactionType } from '@expense-tracker/shared';

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  description?: string;
}

export const transactionsApi = {
  list: () => apiRequest<Transaction[]>('/transactions'),

  create: (data: CreateTransactionInput) =>
    apiRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
