export { CreateUserCommand } from './commands/create-user.command';
export { GetUserByEmailQuery } from './queries/get-user-by-email.query';
export { GetUserByIdQuery } from './queries/get-user-by-id.query';
export { EmailAlreadyExistsError } from './domain/errors';
export type { PublicUser, UserWithCredentials } from './domain/user.entity';
