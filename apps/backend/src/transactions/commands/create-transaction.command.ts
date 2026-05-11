import { TransactionType } from '@prisma/client';

/** Команда создания новой транзакции для указанного пользователя. */
export class CreateTransactionCommand {
  /**
   * @param userId - UUID владельца транзакции.
   * @param amount - Сумма (положительное число, не более 2 знаков после запятой).
   * @param type - Тип: `income` или `expense`.
   * @param date - Дата в формате ISO 8601.
   * @param categoryId - UUID категории, принадлежащей этому пользователю.
   * @param description - Необязательное описание (до 500 символов).
   */
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly date: string,
    public readonly categoryId: string,
    public readonly description?: string,
  ) {}
}
