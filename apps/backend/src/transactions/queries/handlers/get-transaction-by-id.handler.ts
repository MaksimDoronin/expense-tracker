import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublicTransaction } from '../../domain/transaction.entity';
import { TransactionNotFoundError } from '../../domain/errors';
import { transactionSelect, toPublicTransaction } from '../../transactions.helpers';
import { GetTransactionByIdQuery } from '../get-transaction-by-id.query';

@QueryHandler(GetTransactionByIdQuery)
export class GetTransactionByIdHandler
  implements IQueryHandler<GetTransactionByIdQuery, PublicTransaction>
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Возвращает одну транзакцию по ID с проверкой принадлежности пользователю.
   *
   * @param query - `id` транзакции и `userId` владельца.
   * @returns `PublicTransaction` для найденной транзакции.
   * @throws {TransactionNotFoundError} Если транзакция не найдена или принадлежит другому пользователю.
   */
  async execute(query: GetTransactionByIdQuery): Promise<PublicTransaction> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: query.id, userId: query.userId },
      select: transactionSelect,
    });
    if (!transaction) throw new TransactionNotFoundError();

    return toPublicTransaction(transaction);
  }
}
