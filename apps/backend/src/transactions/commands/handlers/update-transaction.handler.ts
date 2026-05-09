import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublicTransaction } from '../../domain/transaction.entity';
import {
  CategoryNotFoundForTransactionError,
  TransactionNotFoundError,
} from '../../domain/errors';
import { transactionSelect, toPublicTransaction } from '../../transactions.helpers';
import { UpdateTransactionCommand } from '../update-transaction.command';

@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler
  implements ICommandHandler<UpdateTransactionCommand, PublicTransaction>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateTransactionCommand): Promise<PublicTransaction> {
    const existing = await this.prisma.transaction.findFirst({
      where: { id: command.id, userId: command.userId },
    });
    if (!existing) throw new TransactionNotFoundError();

    if (command.categoryId && command.categoryId !== existing.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: command.categoryId, userId: command.userId },
      });
      if (!category) throw new CategoryNotFoundForTransactionError();
    }

    const transaction = await this.prisma.transaction.update({
      where: { id: command.id },
      data: {
        ...(command.amount !== undefined && { amount: command.amount }),
        ...(command.type !== undefined && { type: command.type }),
        ...(command.date !== undefined && { date: new Date(command.date) }),
        ...(command.categoryId !== undefined && { categoryId: command.categoryId }),
        ...(command.description !== undefined && { description: command.description }),
      },
      select: transactionSelect,
    });

    return toPublicTransaction(transaction);
  }
}
