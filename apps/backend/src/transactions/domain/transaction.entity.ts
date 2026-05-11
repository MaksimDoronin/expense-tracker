import { TransactionType } from '@prisma/client';

/** Публичное представление транзакции, возвращаемое API. `amount` — строка для точной передачи Decimal. */
export interface PublicTransaction {
  id: string;
  /** Сумма в виде строки с двумя знаками после запятой (например «123.45»). */
  amount: string;
  type: TransactionType;
  description: string | null;
  date: Date;
  categoryId: string;
  userId: string;
  createdAt: Date;
}

/** Агрегированная сводка доходов и расходов за один календарный месяц. */
export interface TransactionSummary {
  month: number;
  year: number;
  /** Суммарный доход за месяц (строка с двумя знаками после запятой). */
  totalIncome: string;
  /** Суммарный расход за месяц (строка с двумя знаками после запятой). */
  totalExpense: string;
  /** Разница `totalIncome − totalExpense` (может быть отрицательной). */
  balance: string;
  /** Разбивка суммы по категориям и типу транзакции. */
  byCategory: Array<{ categoryId: string; type: TransactionType; total: string }>;
}
