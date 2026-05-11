/** Выбрасывается, когда транзакция не найдена или не принадлежит пользователю. Контроллер преобразует в HTTP 404. */
export class TransactionNotFoundError extends Error {
  constructor() {
    super('Transaction not found');
    this.name = 'TransactionNotFoundError';
  }
}

/** Выбрасывается, когда указанная категория не существует или принадлежит другому пользователю. Контроллер преобразует в HTTP 404. */
export class CategoryNotFoundForTransactionError extends Error {
  constructor() {
    super('Category not found or does not belong to user');
    this.name = 'CategoryNotFoundForTransactionError';
  }
}

/** Выбрасывается, когда владелец транзакции (пользователь) не найден в БД. Контроллер преобразует в HTTP 401. */
export class OwnerNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'OwnerNotFoundError';
  }
}
