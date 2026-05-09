import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionNotFoundError } from '../../domain/errors';
import { DeleteTransactionCommand } from '../delete-transaction.command';

@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteTransactionCommand): Promise<void> {
    const existing = await this.prisma.transaction.findFirst({
      where: { id: command.id, userId: command.userId },
    });
    if (!existing) throw new TransactionNotFoundError();

    await this.prisma.transaction.delete({ where: { id: command.id } });
  }
}
