/** Запрос пользователя по email, включая хеш пароля. Используется в `AuthService.login` для верификации учётных данных. */
export class GetUserByEmailQuery {
  /**
   * @param email - Email искомого пользователя.
   */
  constructor(public readonly email: string) {}
}
