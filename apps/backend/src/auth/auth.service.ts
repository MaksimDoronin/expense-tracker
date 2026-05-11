import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserCommand,
  EmailAlreadyExistsError,
  GetUserByEmailQuery,
  GetUserByIdQuery,
  PublicUser,
  UserWithCredentials,
} from '../users';

interface AccessJwtPayload {
  sub: string;
  email: string;
}

export interface AuthResult {
  user: PublicUser;
  tokens: { accessToken: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Регистрирует нового пользователя: хеширует пароль, создаёт запись и выдаёт токен.
   *
   * @param name - Отображаемое имя пользователя.
   * @param email - Email (должен быть уникальным).
   * @param password - Пароль в открытом виде; хешируется bcrypt с cost 10.
   * @returns `AuthResult` с `PublicUser` и `accessToken`.
   * @throws {ConflictException} Если email уже зарегистрирован.
   */
  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(password, 10);
    try {
      const user = await this.commandBus.execute<CreateUserCommand, PublicUser>(
        new CreateUserCommand(name, email, passwordHash),
      );
      return { user, tokens: { accessToken: await this.signToken(user) } };
    } catch (err) {
      if (err instanceof EmailAlreadyExistsError) {
        throw new ConflictException(err.message);
      }
      throw err;
    }
  }

  /**
   * Аутентифицирует пользователя по email и паролю.
   *
   * @param email - Email зарегистрированного пользователя.
   * @param password - Пароль в открытом виде; сверяется с bcrypt-хешем из БД.
   * @returns `AuthResult` с `PublicUser` и `accessToken`.
   * @throws {UnauthorizedException} Если email не найден или пароль неверен.
   */
  async login(email: string, password: string): Promise<AuthResult> {
    const found = await this.queryBus.execute<GetUserByEmailQuery, UserWithCredentials | null>(
      new GetUserByEmailQuery(email),
    );
    if (!found || !(await bcrypt.compare(password, found.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user: PublicUser = { id: found.id, name: found.name, email: found.email };
    return { user, tokens: { accessToken: await this.signToken(user) } };
  }

  /**
   * Возвращает профиль текущего пользователя по ID из JWT.
   *
   * @param userId - UUID из поля `sub` JWT-payload.
   * @returns `PublicUser` (id, name, email).
   * @throws {UnauthorizedException} Если пользователь не найден (например, удалён после выдачи токена).
   */
  async getMe(userId: string): Promise<PublicUser> {
    const user = await this.queryBus.execute<GetUserByIdQuery, PublicUser | null>(
      new GetUserByIdQuery(userId),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  /**
   * Подписывает JWT-токен для пользователя.
   *
   * @param user - Данные пользователя; `id` становится `sub`, `email` включается в payload.
   * @returns Подписанный JWT-токен.
   */
  private signToken(user: PublicUser): Promise<string> {
    const payload: AccessJwtPayload = { sub: user.id, email: user.email };
    return this.jwt.signAsync(payload);
  }
}
