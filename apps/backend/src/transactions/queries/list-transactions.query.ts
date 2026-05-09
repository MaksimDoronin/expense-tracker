import { TransactionType } from '@prisma/client';

export class ListTransactionsQuery {
  constructor(
    public readonly userId: string,
    public readonly dateFrom?: string,
    public readonly dateTo?: string,
    public readonly type?: TransactionType,
    public readonly categoryId?: string,
  ) {}
}
