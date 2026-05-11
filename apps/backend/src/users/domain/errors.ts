/** Выбрасывается при попытке создать пользователя с уже занятым email. `AuthService` преобразует в HTTP 409. */
export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email "${email}" already exists`);
    this.name = 'EmailAlreadyExistsError';
  }
}
