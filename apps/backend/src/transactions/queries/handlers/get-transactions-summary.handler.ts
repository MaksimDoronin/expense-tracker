import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionSummary } from '../../domain/transaction.entity';
import { GetTransactionsSummaryQuery } from '../get-transactions-summary.query';

@QueryHandler(GetTransactionsSummaryQuery)
export class GetTransactionsSummaryHandler
  implements IQueryHandler<GetTransactionsSummaryQuery, TransactionSummary>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTransactionsSummaryQuery): Promise<TransactionSummary> {
    const from = new Date(query.year, query.month - 1, 1);
    const to = new Date(query.year, query.month, 1);

    const rows = await this.prisma.transaction.groupBy({
      by: ['type', 'categoryId'],
      where: { userId: query.userId, date: { gte: from, lt: to } },
      _sum: { amount: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const byCategory: TransactionSummary['byCategory'] = [];

    for (const row of rows) {
      const total = Number(row._sum.amount ?? 0);
      if (row.type === TransactionType.income) {
        totalIncome += total;
      } else {
        totalExpense += total;
      }
      byCategory.push({ categoryId: row.categoryId, type: row.type, total: total.toFixed(2) });
    }

    return {
      month: query.month,
      year: query.year,
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      balance: (totalIncome - totalExpense).toFixed(2),
      byCategory,
    };
  }
}
