import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublicUser } from '../../domain/user.entity';
import { GetUserByIdQuery } from '../get-user-by-id.query';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, PublicUser | null> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserByIdQuery): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { id: query.id },
      select: { id: true, name: true, email: true },
    });
  }
}
