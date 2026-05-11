/** Запрос агрегированной сводки доходов/расходов за один календарный месяц. */
export class GetTransactionsSummaryQuery {
  /**
   * @param userId - UUID пользователя.
   * @param month - Номер месяца (1–12).
   * @param year - Год (1970–2100).
   */
  constructor(
    public readonly userId: string,
    public readonly month: number,
    public readonly year: number,
  ) {}
}
