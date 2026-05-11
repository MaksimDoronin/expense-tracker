/** Запрос одной транзакции по ID. Проверяет принадлежность пользователю на уровне хендлера. */
export class GetTransactionByIdQuery {
  /**
   * @param id - UUID транзакции.
   * @param userId - UUID владельца; используется для авторизации.
   */
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
