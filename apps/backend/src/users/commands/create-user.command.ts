/** Команда создания нового пользователя. Хеш пароля передаётся готовым — хеширование выполняется в `AuthService`. */
export class CreateUserCommand {
  /**
   * @param name - Отображаемое имя.
   * @param email - Email (должен быть уникальным).
   * @param passwordHash - Bcrypt-хеш пароля.
   */
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
  ) {}
}
