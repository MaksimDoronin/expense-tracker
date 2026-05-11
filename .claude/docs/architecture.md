# Архитектура

## Обзор

Монорепозиторий на npm workspaces с тремя пакетами:

```
expense-tracker/
  apps/
    backend/    # NestJS API, порт 3001
    frontend/   # Next.js 16 / React 19, порт 3000
  packages/
    shared/     # общие TypeScript-типы (алиас @expense-tracker/shared)
  prisma/       # схема БД и миграции (в корне репо)
```

---

## Backend (NestJS)

### Слои

```
src/
  auth/           # аутентификация и авторизация
  categories/     # CRUD категорий расходов
  transactions/   # CRUD транзакций + сводка
  users/          # управление пользователями (используется внутренне)
  prisma/         # глобальный PrismaModule/PrismaService
  app.module.ts
  main.ts
```

### Паттерн внутри доменного модуля

Все бизнес-модули (`categories`, `transactions`, `users`) придерживаются единой структуры:

```
<module>/
  domain/
    <entity>.entity.ts   # публичный интерфейс (PublicX), возвращаемый API
    errors.ts            # доменные ошибки (extends Error)
  dto/                   # входные DTO с class-validator + @ApiProperty
  commands/              # (transactions, users) CQRS-команды и их обработчики
    handlers/
  queries/               # (transactions, users) CQRS-запросы и их обработчики
    handlers/
  <module>.controller.ts
  <module>.service.ts
  <module>.module.ts
  index.ts               # barrel-экспорт (у users)
```

### CQRS (transactions, users)

`@nestjs/cqrs` используется в `transactions` и `users`. Паттерн:

1. **Command/Query** — простой класс с данными, без логики.
2. **Handler** — `@CommandHandler` / `@QueryHandler`, содержит логику, работает с Prisma напрямую.
3. **Service** — инжектирует `CommandBus` и `QueryBus`, делегирует им все операции.

Все обработчики объявляются вручную в `providers[]` модуля.

### Аутентификация

- JWT (HS256), секрет из `JWT_SECRET`.
- Токен — в заголовке `Authorization: Bearer <token>`.
- `JwtStrategy.validate()` → `JwtAccessPayload { sub: string; email: string }`.
- `@CurrentUser()` — параметрический декоратор, извлекает payload из `request.user`.
- `@UseGuards(JwtAuthGuard)` — защита контроллера или метода.
- Пароли хешируются через `bcryptjs`.

### Обработка доменных ошибок

Контроллер перехватывает доменные ошибки и преобразует их в HTTP-исключения NestJS:

| Ошибка                                | HTTP  |
|---------------------------------------|-------|
| `EmailAlreadyExistsError`             | 409   |
| `OwnerNotFoundError`                  | 401   |
| `CategoryNotFoundError`               | 404   |
| `CategoryNameTakenError`              | 409   |
| `TransactionNotFoundError`            | 404   |
| `CategoryNotFoundForTransactionError` | 404   |

`EmailAlreadyExistsError` перехватывается в `AuthService` (не в контроллере).

### Валидация

Глобальный `ValidationPipe` в `main.ts`:
- `whitelist: true` — убирает лишние поля
- `forbidNonWhitelisted: true` — 400 при наличии лишних полей
- `transform: true` — преобразование типов (строки → числа и т.д.)

### Зависимости модулей

| Модуль              | Импортирует                                   | Экспортирует    |
|---------------------|-----------------------------------------------|-----------------|
| `PrismaModule`      | —                                             | `PrismaService` |
| `UsersModule`       | `CqrsModule`                                  | —               |
| `AuthModule`        | `UsersModule`, `JwtModule`, `PassportModule`  | `JwtAuthGuard`  |
| `CategoriesModule`  | `CqrsModule`, `PrismaModule`, `UsersModule`   | —               |
| `TransactionsModule`| `CqrsModule`                                  | —               |

---

## Frontend (Next.js)

### Методология: Feature Slice Design (FSD)

Слои (вышестоящие импортируют только из нижестоящих):

```
app/        → features, shared
features/   → shared, @expense-tracker/shared
shared/     → (ничего из выше)
```

```
src/
  app/                    # Next.js App Router, глобальные провайдеры, стили
    (auth)/               # страницы без навигации: /login, /register
    (app)/                # защищённые страницы с Sidebar
      _components/        # приватные компоненты layout-а (не переиспользуются)
  features/
    auth/                 # авторизация: AuthProvider, формы, guard
    categories/           # список категорий
    transactions/         # список, создание транзакций
  shared/
    api/client.ts         # apiRequest<T>(), ApiError
    lib/auth-storage.ts   # обёртка localStorage (SSR-safe)
    types/auth.ts         # AuthUser, AuthResult и пр.
    ui/                   # shadcn/ui компоненты (Button, Input, Card, Dialog, ...)
```

### Маршруты

| Путь            | Защита      | Описание              |
|-----------------|-------------|-----------------------|
| `/`             | RequireAuth | Дашборд               |
| `/transactions` | RequireAuth | Список транзакций     |
| `/categories`   | RequireAuth | Управление категориями|
| `/profile`      | RequireAuth | Профиль               |
| `/login`        | —           | Форма входа           |
| `/register`     | —           | Регистрация           |

### HTTP-клиент

`apiRequest<T>(path, options?)` — единственная точка HTTP-запросов:
- Базовый URL: `NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'`
- Автоматически добавляет `Authorization: Bearer <token>` из `authStorage`
- При `401` — очищает токен, диспатчит `auth:logout`
- При `!res.ok` — кидает `ApiError(message, status)`
- При `204` — возвращает `undefined as T`

### Управление состоянием

Нет глобального стора. Состояние через:
- `AuthProvider` (React Context) — данные пользователя и токен
- Хуки с локальным `useState` — данные страниц (`useTransactions`, `useCategoriesMap`)
- `react-hook-form` + `zod` — формы

---

## Shared

`packages/shared/src/index.ts` — типы, используемые и фронтендом, и бэкендом:
- Auth: `AuthUser`, `AuthTokens`, `AuthResponse`, `LoginInput`, `RegisterInput`
- Domain: `Transaction`, `TransactionType`, `Category`, `CreateCategoryInput`, `UpdateCategoryInput`
- Legacy (не удалять): `Expense`, `CreateExpenseInput`, `Currency`

**Правило:** любой тип, используемый обоими приложениями, должен быть здесь.
