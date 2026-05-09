# План: модуль Transactions

## Контекст
Нужен центральный модуль учёта доходов/расходов поверх существующих модулей `users` и `categories`. Модуль повторяет файловую структуру `apps/backend/src/categories/`, но использует **полный CQRS** (как `users/`): каждая операция = Command/Query + Handler. Сервис остаётся тонким фасадом, контроллер маппит домен-ошибки в HTTP. Существующая модель `Expense` не трогается.

## Изменения схемы Prisma
Файл: `prisma/schema.prisma`

1. Добавить enum:
```prisma
enum TransactionType {
  income
  expense
}
```

2. Добавить модель:
```prisma
model Transaction {
  id          String          @id @default(uuid())
  amount      Decimal         @db.Decimal(12, 2)
  type        TransactionType
  description String?
  date        DateTime
  categoryId  String
  userId      String
  createdAt   DateTime        @default(now())

  category    Category        @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
  @@index([categoryId])
}
```

3. В `model User` добавить: `transactions Transaction[]`
4. В `model Category` добавить: `transactions Transaction[]`

5. Применить:
```bash
npm run prisma:migrate -- --name add_transactions
npm run prisma:generate
```

## Структура модуля
Создать `apps/backend/src/transactions/`:
```
transactions.module.ts
transactions.controller.ts
transactions.service.ts
index.ts
domain/
  transaction.entity.ts        # PublicTransaction interface, TransactionSummary interface
  errors.ts                    # TransactionNotFoundError, CategoryNotFoundForTransactionError, OwnerNotFoundError
dto/
  create-transaction.dto.ts
  update-transaction.dto.ts
  list-transactions.query.dto.ts   # dateFrom, dateTo, type, categoryId (все @IsOptional)
  summary.query.dto.ts             # month (1..12), year — оба обязательные, @Type(() => Number)
commands/
  create-transaction.command.ts
  update-transaction.command.ts
  delete-transaction.command.ts
  handlers/
    create-transaction.handler.ts
    update-transaction.handler.ts
    delete-transaction.handler.ts
queries/
  get-transaction-by-id.query.ts
  list-transactions.query.ts
  get-transactions-summary.query.ts
  handlers/
    get-transaction-by-id.handler.ts
    list-transactions.handler.ts
    get-transactions-summary.handler.ts
```

## DTO (class-validator)
- `CreateTransactionDto`:
  - `amount`: `@IsNumber({ maxDecimalPlaces: 2 })`, `@IsPositive()`, `@Type(() => Number)`
  - `type`: `@IsEnum(TransactionType)` (импорт enum из `@prisma/client`)
  - `description`: `@IsOptional() @IsString() @MaxLength(500)`
  - `date`: `@IsDateString()`
  - `categoryId`: `@IsUUID()`
- `UpdateTransactionDto extends PartialType(CreateTransactionDto)`
- `ListTransactionsQueryDto`: все поля `@IsOptional()`; `dateFrom`/`dateTo` — `@IsDateString()`; `type` — `@IsEnum`; `categoryId` — `@IsUUID()`
- `SummaryQueryDto`: `month` `@IsInt() @Min(1) @Max(12) @Type(() => Number)`; `year` `@IsInt() @Min(1970) @Max(2100) @Type(() => Number)`

В `apps/backend/src/main.ts` убедиться, что включён `ValidationPipe` с `transform: true` (если ещё нет — добавить, иначе query-параметры не приведутся к числам).

## CQRS handlers (логика)

**CreateTransactionHandler** — выполняет `GetUserByIdQuery` → `OwnerNotFoundError`; проверяет `prisma.category.findFirst({ id, userId })` → `CategoryNotFoundForTransactionError`; создаёт запись.

**UpdateTransactionHandler** — `findFirst({ id, userId })` → `TransactionNotFoundError`; если `categoryId` меняется — проверка владения категорией; `update`.

**DeleteTransactionHandler** — `findFirst({ id, userId })` → `TransactionNotFoundError`; `delete`.

**GetTransactionByIdHandler** — `findFirst({ id, userId })`, иначе `TransactionNotFoundError`.

**ListTransactionsHandler** — собирает `where`: `userId` + опц. `date: { gte: dateFrom, lte: dateTo }` + `type` + `categoryId`; `orderBy: { date: 'desc' }`.

**GetTransactionsSummaryHandler** — диапазон `[год-месяц-01, следующий месяц-01)`; через `prisma.transaction.groupBy({ by: ['type', 'categoryId'], where, _sum: { amount } })`. Возвращает:
```ts
{
  month, year,
  totalIncome: string,    // Decimal → string
  totalExpense: string,
  balance: string,
  byCategory: Array<{ categoryId, type, total: string }>
}
```
`Decimal` сериализуем в строку, чтобы не терять точность.

## Контроллер
`@UseGuards(JwtAuthGuard)`, `@Controller('transactions')`. Маршруты в порядке (важно: `summary` ДО `:id`):

- `POST /` → `CreateTransactionCommand`
- `GET /` (`@Query() ListTransactionsQueryDto`) → `ListTransactionsQuery`
- `GET /summary` (`@Query() SummaryQueryDto`) → `GetTransactionsSummaryQuery`
- `GET /:id` → `GetTransactionByIdQuery`
- `PATCH /:id` → `UpdateTransactionCommand`
- `DELETE /:id` (`@HttpCode(204)`) → `DeleteTransactionCommand`

Маппинг ошибок: `TransactionNotFoundError`/`CategoryNotFoundForTransactionError` → `NotFoundException`; `OwnerNotFoundError` → `UnauthorizedException`.

`PublicTransaction` сериализует `amount` как `string` (через `.toString()` в маппере), чтобы не терять точность Decimal в JSON.

## Регистрация
- В `app.module.ts` импортировать `TransactionsModule` после `CategoriesModule`.
- В `transactions.module.ts`: `imports: [CqrsModule]`, `controllers: [TransactionsController]`, `providers: [TransactionsService, ...CommandHandlers, ...QueryHandlers]`.

## Критические файлы
- `prisma/schema.prisma`
- `apps/backend/src/app.module.ts`
- `apps/backend/src/main.ts` (проверить ValidationPipe transform)
- `apps/backend/src/transactions/**` (новые)

## Переиспользуемое
- `JwtAuthGuard` — `apps/backend/src/auth/guards/jwt-auth.guard.ts`
- `@CurrentUser()` + `JwtAccessPayload` — `apps/backend/src/auth/`
- `PrismaService` — `apps/backend/src/prisma/prisma.service.ts` (глобальный)
- `GetUserByIdQuery` из `apps/backend/src/users` — для проверки существования пользователя в `CreateTransactionHandler`
- `PartialType` из `@nestjs/mapped-types` — для UpdateDto

## Статус реализации
- [x] Схема Prisma обновлена (enum TransactionType, модель Transaction, связи в User и Category)
- [x] `prisma generate` выполнен — клиент актуален
- [x] `prisma migrate` — миграция `20260509145045_add_transactions` применена
- [x] Домен: `transaction.entity.ts`, `errors.ts`
- [x] DTO: create, update, list query, summary query
- [x] CQRS команды + обработчики: create, update, delete
- [x] CQRS запросы + обработчики: getById, list, summary
- [x] `transactions.helpers.ts` — общий select и маппер Decimal→string
- [x] `TransactionsService`, `TransactionsController`, `TransactionsModule`
- [x] `TransactionsModule` зарегистрирован в `AppModule`
- [x] `npm run build --workspace=backend` — сборка зелёная

## Проверка (verification)
1. `npm run prisma:migrate -- --name add_transactions` — миграция применилась
2. `npm run build --workspace=backend` — сборка зелёная ✅
3. `npm run dev:backend`, затем через curl с валидным JWT:
   - `POST /transactions` с валидным body → 201, в ответе `id`
   - `GET /transactions?type=expense&dateFrom=2026-01-01` → массив отфильтрован
   - `GET /transactions/summary?month=5&year=2026` → суммы с `totalIncome/totalExpense/balance`
   - `GET /transactions/:id` чужого пользователя → 404
   - `PATCH /transactions/:id` с невладельческой `categoryId` → 404
   - `DELETE /transactions/:id` → 204
   - `POST` с `amount: -1` или `month: 13` → 400 (валидация)
