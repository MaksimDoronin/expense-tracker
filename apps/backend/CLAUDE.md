## Архитектура бэкенда

NestJS приложение с CQRS-паттерном. Каждый доменный модуль организован по одной схеме:

```
src/
  auth/
    decorators/     # @CurrentUser() — извлекает JwtAccessPayload из request
    dto/            # LoginDto, RegisterDto (class-validator)
    guards/         # JwtAuthGuard (passport-jwt)
    strategies/     # JwtStrategy — валидирует Bearer-токен, возвращает JwtAccessPayload
    auth.controller.ts
    auth.module.ts
    auth.service.ts
  categories/
    domain/
      category.entity.ts   # PublicCategory интерфейс
      errors.ts             # CategoryNotFoundError, CategoryNameTakenError, OwnerNotFoundError
    dto/                    # CreateCategoryDto, UpdateCategoryDto
    categories.controller.ts
    categories.module.ts
    categories.service.ts
  transactions/
    commands/               # CreateTransaction, UpdateTransaction, DeleteTransaction
      handlers/             # Соответствующие CommandHandler-ы
    queries/                # GetTransactionById, ListTransactions, GetTransactionsSummary
      handlers/             # Соответствующие QueryHandler-ы
    domain/
      transaction.entity.ts  # PublicTransaction, TransactionSummary
      errors.ts              # TransactionNotFoundError, CategoryNotFoundForTransactionError, OwnerNotFoundError
    dto/                    # CreateTransactionDto, UpdateTransactionDto, ListTransactionsQueryDto, SummaryQueryDto
    transactions.controller.ts
    transactions.module.ts
    transactions.service.ts
    transactions.helpers.ts
  users/
    commands/               # CreateUser + handler
    queries/                # GetUserByEmail, GetUserById + handlers
    domain/
      user.entity.ts        # PublicUser, UserWithCredentials
      errors.ts
    users.module.ts
  prisma/
    prisma.module.ts        # глобальный модуль
    prisma.service.ts       # extends PrismaClient, подключается в onModuleInit
  app.module.ts
  main.ts
```

## Модули и зависимости

| Модуль              | Импортирует                          | Экспортирует        |
|---------------------|--------------------------------------|---------------------|
| `PrismaModule`      | —                                    | `PrismaService`     |
| `UsersModule`       | `CqrsModule`, `PrismaModule`         | —                   |
| `AuthModule`        | `UsersModule`, `JwtModule`, `PassportModule` | `JwtAuthGuard` |
| `CategoriesModule`  | `CqrsModule`, `PrismaModule`, `UsersModule` | —           |
| `TransactionsModule`| `CqrsModule`                         | —                   |

## CQRS-паттерн

Модули `transactions` и `users` используют `@nestjs/cqrs`. Паттерн:

1. **Command** — простой класс-объект с данными для изменения состояния
2. **CommandHandler** — `@CommandHandler(XCommand)` implements `ICommandHandler<XCommand>`
3. **Query** — простой класс-объект для чтения данных
4. **QueryHandler** — `@QueryHandler(XQuery)` implements `IQueryHandler<XQuery>`
5. **Service** — инжектирует `CommandBus` и `QueryBus`, делегирует им выполнение

Все обработчики объявляются в `providers` модуля — никакой авторегистрации нет.

## Аутентификация

- Алгоритм: JWT (HS256), секрет из `JWT_SECRET`
- Токен передаётся в заголовке `Authorization: Bearer <token>`
- `JwtStrategy.validate()` возвращает `JwtAccessPayload { sub: string; email: string }`
- `@CurrentUser()` декоратор извлекает payload из `request.user`
- `@UseGuards(JwtAuthGuard)` защищает контроллер или отдельный эндпоинт
- Пароли хешируются через `bcryptjs`

## API Endpoints

Все защищённые маршруты требуют `Authorization: Bearer <token>`.

### Auth (`/auth`)
| Метод | Путь               | Описание                         |
|-------|--------------------|----------------------------------|
| POST  | `/auth/register`   | Регистрация, возвращает токен    |
| POST  | `/auth/login`      | Вход, возвращает токен           |

### Categories (`/categories`) — защищены JWT
| Метод  | Путь               | Описание                         |
|--------|--------------------|----------------------------------|
| POST   | `/categories`      | Создать категорию                |
| GET    | `/categories`      | Список категорий текущего юзера  |
| PATCH  | `/categories/:id`  | Обновить категорию               |
| DELETE | `/categories/:id`  | Удалить категорию (204)          |

### Transactions (`/transactions`) — защищены JWT
| Метод  | Путь                        | Описание                            |
|--------|-----------------------------|-------------------------------------|
| POST   | `/transactions`             | Создать транзакцию                  |
| GET    | `/transactions`             | Список с фильтрацией (query params) |
| GET    | `/transactions/summary`     | Сводка доходов/расходов по месяцу  |
| GET    | `/transactions/:id`         | Получить транзакцию по id           |
| PATCH  | `/transactions/:id`         | Обновить транзакцию                 |
| DELETE | `/transactions/:id`         | Удалить транзакцию (204)            |

## Domain Errors

Каждый модуль экспортирует доменные ошибки из `domain/errors.ts`. Контроллер перехватывает их и преобразует в HTTP-исключения NestJS:

| Ошибка                              | HTTP-статус  |
|-------------------------------------|--------------|
| `OwnerNotFoundError`                | 401          |
| `CategoryNotFoundError`             | 404          |
| `CategoryNameTakenError`            | 409          |
| `TransactionNotFoundError`          | 404          |
| `CategoryNotFoundForTransactionError` | 404        |

## Валидация

Глобальный `ValidationPipe` в `main.ts`:
- `whitelist: true` — убирает лишние поля из DTO
- `forbidNonWhitelisted: true` — возвращает 400 при наличии лишних полей
- `transform: true` — автоматически преобразует типы (строки в числа и т.д.)

DTO используют декораторы `class-validator` и `class-transformer`.

## Переменные окружения

| Переменная     | Где задаётся         | Описание                       |
|----------------|----------------------|--------------------------------|
| `DATABASE_URL` | `.env` в корне       | PostgreSQL connection string   |
| `JWT_SECRET`   | `.env` в корне       | Секрет для подписи JWT         |
| `BACKEND_PORT` | `.env` (опционально) | Порт сервера (по умолчанию 3001) |

`ConfigModule.forRoot` загружает `../../.env` (корень монорепо) и `.env` (локальный для бэкенда).
