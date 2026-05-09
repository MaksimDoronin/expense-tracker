# План: реализация авторизации (User + Auth с JWT через CQRS)

## Context

Минимальная реализация под задачу: модуль `User` (имя, email, хэш пароля), модуль `Auth` с двумя методами (`login`, `register`) на JWT. Взаимодействие между модулями — только через CQRS (никаких прямых импортов сервисов/репозиториев из `users` в `auth`).

Модель `User` в Prisma:
```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Шаг 1 — Модуль `users` (домен пользователя, CQRS) — [x]

Структура `apps/backend/src/users/`:

```
users/
├── users.module.ts          # CqrsModule + регистрация handlers, экспорт barrel
├── index.ts                 # public API: классы Command/Query + типы PublicUser
├── domain/
│   ├── user.entity.ts       # PublicUser, UserWithCredentials
│   └── errors.ts            # EmailAlreadyExistsError
├── commands/
│   ├── create-user.command.ts
│   └── handlers/create-user.handler.ts
└── queries/
    ├── get-user-by-email.query.ts
    └── handlers/get-user-by-email.handler.ts
```

Контракт public API (`users/index.ts` — единственный путь, который импортирует Auth):
- классы `CreateUserCommand({ name, email, passwordHash })` → `Promise<PublicUser>`
- классы `GetUserByEmailQuery({ email })` → `Promise<UserWithCredentials | null>` (включает `passwordHash` — нужен Auth для верификации)
- типы `PublicUser`, `UserWithCredentials`, ошибка `EmailAlreadyExistsError`

Хэндлеры инжектят `PrismaService` напрямую (PrismaModule уже глобальный). `CreateUserHandler` ловит Prisma `P2002` (unique violation на email) → бросает `EmailAlreadyExistsError`.

Нет HTTP-контроллера у этого модуля — он чисто доменный.

## Шаг 2 — Модуль `auth` (HTTP + JWT) — [x]

Структура `apps/backend/src/auth/`:

```
auth/
├── auth.module.ts           # CqrsModule, JwtModule.registerAsync (секрет/ttl из ConfigService), PassportModule
├── auth.controller.ts       # POST /auth/register, POST /auth/login
├── auth.service.ts          # оркестратор: bcrypt + CommandBus/QueryBus + JwtService
├── dto/
│   ├── register.dto.ts      # name, email, password (class-validator)
│   └── login.dto.ts         # email, password
├── strategies/jwt.strategy.ts
└── guards/jwt-auth.guard.ts # экспортируется для других модулей
```

`AuthService`:
- `register(dto)` — хэширует пароль (bcryptjs, 10 раундов) → `commandBus.execute(new CreateUserCommand(...))` → выдаёт `accessToken`. На `EmailAlreadyExistsError` → `ConflictException`.
- `login(dto)` — `queryBus.execute(new GetUserByEmailQuery(...))` → `bcrypt.compare` → `accessToken`. При неуспехе → `UnauthorizedException`.

Импорты в `auth/*` ограничены публичным barrel `users/index.ts` — только классы Command/Query и типы. Нет импортов `UsersService`, хэндлеров, репозиториев или Prisma напрямую из users.

JWT настройки из `ConfigService`: `JWT_SECRET`, `JWT_ACCESS_TTL` (по умолчанию `15m`). Payload: `{ sub: userId, email }`.

`JwtAuthGuard` экспортируется из `AuthModule` — пригодится позже для защиты Expense-роутов (вне скоупа этой задачи).

## Шаг 3 — Конфигурация и shared — [x]

> Дополнительно: обновлена `prisma/schema.prisma` (удалена модель `RefreshToken`), регенерирован Prisma client.

- `app.module.ts`: подключить `UsersModule` и `AuthModule`
- `.env` (root): добавить `JWT_SECRET=...` и (опц.) `JWT_ACCESS_TTL=15m`
- `packages/shared/src/index.ts`: `AuthTokens` = `{ accessToken: string }`, типы `AuthUser`, `AuthResponse`, `LoginInput`, `RegisterInput`

## Критичные файлы

- `apps/backend/src/app.module.ts` — регистрация модулей
- `apps/backend/src/users/index.ts` — единственная точка контракта между модулями
- `apps/backend/src/auth/auth.service.ts` — оркестратор, использует только CommandBus/QueryBus
- `packages/shared/src/index.ts` — общие контракты

## Verification

1. `npm run db:up && npx prisma migrate dev` — миграции применяются
2. `npm run type-check --workspace=backend` — без ошибок
3. `npm run lint` — без ошибок
4. `npm run dev:backend`, проверить вручную:
   - `POST /auth/register {name,email,password}` → 201, `{ user, accessToken }`
   - повтор того же email → 409 Conflict
   - `POST /auth/login {email,password}` → 200, `{ user, accessToken }`
   - неверный пароль → 401 Unauthorized
   - валидация: пустой/невалидный email/короткий пароль → 400 (через глобальный `ValidationPipe`)
5. Декодировать JWT — payload содержит `sub` и `email`, exp ~15m
6. Grep по `apps/backend/src/auth/**` — нет импортов из `users/commands/`, `users/queries/`, `users/domain/` напрямую; только из `@/users` (barrel)
