import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetUserByIdQuery } from '../../../users';
import { PublicTransaction } from '../../domain/transaction.entity';
import {
  CategoryNotFoundForTransactionError,
  OwnerNotFoundError,
} from '../../domain/errors';
import { transactionSelect, toPublicTransaction } from '../../transactions.helpers';
import { CreateTransactionCommand } from '../create-transaction.command';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
  implements ICommandHandler<CreateTransactionCommand, PublicTransaction>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: CreateTransactionCommand): Promise<PublicTransaction> {
    const user = await this.queryBus.execute(new GetUserByIdQuery(command.userId));
    if (!user) throw new OwnerNotFoundError();

    const category = await this.prisma.category.findFirst({
      where: { id: command.categoryId, userId: command.userId },
    });
    if (!category) throw new CategoryNotFoundForTransactionError();

    const transaction = await this.prisma.transaction.create({
      data: {
        amount: command.amount,
        type: command.type,
        description: command.description,
        date: new Date(command.date),
        categoryId: command.categoryId,
        userId: command.userId,
      },
      select: transactionSelect,
    });

    return toPublicTransaction(transaction);
  }
}
