import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserHandler } from './commands/handlers/create-user.handler';
import { GetUserByEmailHandler } from './queries/handlers/get-user-by-email.handler';
import { GetUserByIdHandler } from './queries/handlers/get-user-by-id.handler';

const Handlers = [CreateUserHandler, GetUserByEmailHandler, GetUserByIdHandler];

@Module({
  imports: [CqrsModule],
  providers: [...Handlers],
})
export class UsersModule {}
