import { TransactionType } from '@prisma/client';

export class CreateTransactionCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly date: string,
    public readonly categoryId: string,
    public readonly description?: string,
  ) {}
}
