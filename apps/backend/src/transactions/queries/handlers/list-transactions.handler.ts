import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublicTransaction } from '../../domain/transaction.entity';
import { transactionSelect, toPublicTransaction } from '../../transactions.helpers';
import { ListTransactionsQuery } from '../list-transactions.query';

@QueryHandler(ListTransactionsQuery)
export class ListTransactionsHandler
  implements IQueryHandler<ListTransactionsQuery, PublicTransaction[]>
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Возвращает список транзакций пользователя с применением всех переданных фильтров.
   * Результат сортируется по дате по убыванию.
   *
   * @param query - Параметры выборки: `userId` обязателен, остальные фильтры опциональны.
   * @returns Массив `PublicTransaction[]`, отсортированный по `date DESC`.
   */
  async execute(query: ListTransactionsQuery): Promise<PublicTransaction[]> {
    const where: Prisma.TransactionWhereInput = { userId: query.userId };

    if (query.dateFrom || query.dateTo) {
      where.date = {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      };
    }

    if (query.type) where.type = query.type;
    if (query.categoryId) where.categoryId = query.categoryId;

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      select: transactionSelect,
    });

    return transactions.map(toPublicTransaction);
  }
}
