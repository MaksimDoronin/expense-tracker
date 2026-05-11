/** Запрос публичного профиля пользователя по UUID. Используется в `AuthService.getMe` и при валидации владельца в других модулях. */
export class GetUserByIdQuery {
  /**
   * @param id - UUID искомого пользователя.
   */
  constructor(public readonly id: string) {}
}
