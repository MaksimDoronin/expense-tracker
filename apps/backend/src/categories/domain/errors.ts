/** Выбрасывается, когда категория не найдена или не принадлежит пользователю. Контроллер преобразует в HTTP 404. */
export class CategoryNotFoundError extends Error {
  constructor() {
    super('Category not found');
    this.name = 'CategoryNotFoundError';
  }
}

/** Выбрасывается, когда имя категории уже занято у данного пользователя (unique constraint). Контроллер преобразует в HTTP 409. */
export class CategoryNameTakenError extends Error {
  constructor() {
    super('Category with this name already exists');
    this.name = 'CategoryNameTakenError';
  }
}

/** Выбрасывается, когда владелец категории не найден в БД. Контроллер преобразует в HTTP 401. */
export class OwnerNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'OwnerNotFoundError';
  }
}
