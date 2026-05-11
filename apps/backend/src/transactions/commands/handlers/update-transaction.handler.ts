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

  /**
   * Обновляет только переданные поля транзакции. Поля с `undefined` остаются без изменений.
   * Если меняется `categoryId`, дополнительно проверяется принадлежность новой категории пользователю.
   *
   * @param command - Данные для обновления; `id` и `userId` обязательны, остальные поля — опциональны.
   * @returns Обновлённая транзакция в виде `PublicTransaction`.
   * @throws {TransactionNotFoundError} Если транзакция не найдена или не принадлежит пользователю.
   * @throws {CategoryNotFoundForTransactionError} Если новая категория не существует или принадлежит другому пользователю.
   */
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
