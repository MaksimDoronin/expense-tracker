import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateTransactionHandler } from './commands/handlers/create-transaction.handler';
import { DeleteTransactionHandler } from './commands/handlers/delete-transaction.handler';
import { UpdateTransactionHandler } from './commands/handlers/update-transaction.handler';
import { GetTransactionByIdHandler } from './queries/handlers/get-transaction-by-id.handler';
import { GetTransactionsSummaryHandler } from './queries/handlers/get-transactions-summary.handler';
import { ListTransactionsHandler } from './queries/handlers/list-transactions.handler';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

const CommandHandlers = [
  CreateTransactionHandler,
  UpdateTransactionHandler,
  DeleteTransactionHandler,
];

const QueryHandlers = [
  GetTransactionByIdHandler,
  ListTransactionsHandler,
  GetTransactionsSummaryHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, ...CommandHandlers, ...QueryHandlers],
})
export class TransactionsModule {}
