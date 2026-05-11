/** Команда удаления транзакции. Перед удалением хендлер проверяет принадлежность транзакции пользователю. */
export class DeleteTransactionCommand {
  /**
   * @param id - UUID удаляемой транзакции.
   * @param userId - UUID владельца; используется для авторизации.
   */
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
