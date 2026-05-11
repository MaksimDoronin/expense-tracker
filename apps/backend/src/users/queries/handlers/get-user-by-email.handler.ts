import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserWithCredentials } from '../../domain/user.entity';
import { GetUserByEmailQuery } from '../get-user-by-email.query';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler
  implements IQueryHandler<GetUserByEmailQuery, UserWithCredentials | null>
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ищет пользователя по email и возвращает данные вместе с хешем пароля.
   *
   * @param query - Запрос с email искомого пользователя.
   * @returns `UserWithCredentials` если найден, иначе `null`.
   */
  async execute(query: GetUserByEmailQuery): Promise<UserWithCredentials | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: query.email },
      select: { id: true, name: true, email: true, passwordHash: true },
    });
    return user;
  }
}
