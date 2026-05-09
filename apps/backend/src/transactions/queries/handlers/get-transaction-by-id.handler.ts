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

  async execute(query: GetTransactionByIdQuery): Promise<PublicTransaction> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: query.id, userId: query.userId },
      select: transactionSelect,
    });
    if (!transaction) throw new TransactionNotFoundError();

    return toPublicTransaction(transaction);
  }
}
