import { TransactionType } from '@prisma/client';

/** Запрос списка транзакций с опциональной фильтрацией. Все фильтры применяются одновременно (AND). */
export class ListTransactionsQuery {
  /**
   * @param userId - UUID пользователя; возвращаются только его транзакции.
   * @param dateFrom - Нижняя граница диапазона дат (ISO 8601, включительно).
   * @param dateTo - Верхняя граница диапазона дат (ISO 8601, включительно).
   * @param type - Фильтр по типу `income`/`expense`.
   * @param categoryId - UUID категории для фильтрации.
   */
  constructor(
    public readonly userId: string,
    public readonly dateFrom?: string,
    public readonly dateTo?: string,
    public readonly type?: TransactionType,
    public readonly categoryId?: string,
  ) {}
}
