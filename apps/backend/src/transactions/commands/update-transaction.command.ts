import { TransactionType } from '@prisma/client';

/** Команда частичного обновления транзакции. Поля без значения (`undefined`) остаются без изменений. */
export class UpdateTransactionCommand {
  /**
   * @param id - UUID обновляемой транзакции.
   * @param userId - UUID владельца; используется для авторизации.
   * @param amount - Новая сумма (опционально).
   * @param type - Новый тип `income`/`expense` (опционально).
   * @param date - Новая дата ISO 8601 (опционально).
   * @param categoryId - UUID новой категории (опционально).
   * @param description - Новое описание (опционально).
   */
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount?: number,
    public readonly type?: TransactionType,
    public readonly date?: string,
    public readonly categoryId?: string,
    public readonly description?: string,
  ) {}
}
