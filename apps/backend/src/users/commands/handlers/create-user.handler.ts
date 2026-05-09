import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailAlreadyExistsError } from '../../domain/errors';
import { PublicUser } from '../../domain/user.entity';
import { CreateUserCommand } from '../create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, PublicUser> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateUserCommand): Promise<PublicUser> {
    try {
      const user = await this.prisma.user.create({
        data: {
          name: command.name,
          email: command.email,
          passwordHash: command.passwordHash,
        },
        select: { id: true, name: true, email: true },
      });
      return user;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new EmailAlreadyExistsError(command.email);
      }
      throw err;
    }
  }
}
