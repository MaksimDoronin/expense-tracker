/** Публичное представление пользователя, возвращаемое API (без чувствительных данных). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

/** Расширение `PublicUser` с хешем пароля — используется только внутри `AuthService` для верификации. */
export interface UserWithCredentials extends PublicUser {
  passwordHash: string;
}
