import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTransactionCommand } from './commands/create-transaction.command';
import { DeleteTransactionCommand } from './commands/delete-transaction.command';
import { UpdateTransactionCommand } from './commands/update-transaction.command';
import { PublicTransaction, TransactionSummary } from './domain/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions.query.dto';
import { SummaryQueryDto } from './dto/summary.query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { GetTransactionByIdQuery } from './queries/get-transaction-by-id.query';
import { GetTransactionsSummaryQuery } from './queries/get-transactions-summary.query';
import { ListTransactionsQuery } from './queries/list-transactions.query';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  create(userId: string, dto: CreateTransactionDto): Promise<PublicTransaction> {
    return this.commandBus.execute(
      new CreateTransactionCommand(
        userId,
        dto.amount,
        dto.type,
        dto.date,
        dto.categoryId,
        dto.description,
      ),
    );
  }

  findAll(userId: string, query: ListTransactionsQueryDto): Promise<PublicTransaction[]> {
    return this.queryBus.execute(
      new ListTransactionsQuery(
        userId,
        query.dateFrom,
        query.dateTo,
        query.type,
        query.categoryId,
      ),
    );
  }

  getSummary(userId: string, query: SummaryQueryDto): Promise<TransactionSummary> {
    return this.queryBus.execute(
      new GetTransactionsSummaryQuery(userId, query.month, query.year),
    );
  }

  findOne(userId: string, id: string): Promise<PublicTransaction> {
    return this.queryBus.execute(new GetTransactionByIdQuery(id, userId));
  }

  update(userId: string, id: string, dto: UpdateTransactionDto): Promise<PublicTransaction> {
    const d = dto as CreateTransactionDto;
    return this.commandBus.execute(
      new UpdateTransactionCommand(id, userId, d.amount, d.type, d.date, d.categoryId, d.description),
    );
  }

  remove(userId: string, id: string): Promise<void> {
    return this.commandBus.execute(new DeleteTransactionCommand(id, userId));
  }
}
