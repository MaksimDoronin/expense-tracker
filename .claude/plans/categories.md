# План: модуль Categories с CRUD и интеграцией через CQRS

## Context

В проекте уже есть авторизация (JWT, `AuthModule`) и модуль `UsersModule`, организованный по CQRS. Нужно добавить отдельную сущность `Category` (id, name, color, icon, userId), чтобы пользователь мог создавать собственные категории трат. Модуль должен быть полностью защищён JWT-гардом, валидация — через `class-validator`, а взаимодействие с `UsersModule` (проверка владельца) — только через CQRS-шину, без прямой инъекции `PrismaService` для таблицы `User`. Связь Expense↔Category в этой задаче не делаем.

Решения по уточняющим вопросам:
- Имя категории уникально в рамках пользователя (`@@unique([userId, name])`).
- Expense с Category в этой задаче не связываем.

---

## Чек-лист задач

### 1. Prisma schema и миграция
- [x] Добавить модель `Category` в `prisma/schema.prisma` (id uuid, name, color, icon, userId, createdAt, updatedAt)
- [x] Добавить relation `categories Category[]` в модель `User`
- [x] Добавить `@@unique([userId, name])` и `@@index([userId])`
- [x] Настроить `onDelete: Cascade` на FK `userId`
- [x] Запустить `npm run prisma:migrate` (миграция: `20260508200718_add_category`)
- [x] Запустить `npm run prisma:generate`

### 2. Shared types
- [x] В `packages/shared/src/index.ts` добавить интерфейсы `Category`, `CreateCategoryInput`, `UpdateCategoryInput`

### 3. Расширение UsersModule (новая Query)
- [x] Создать `apps/backend/src/users/queries/get-user-by-id.query.ts`
- [x] Создать `apps/backend/src/users/queries/handlers/get-user-by-id.handler.ts` (стиль как у `get-user-by-email.handler.ts`, возвращает `PublicUser | null`, `select` без `passwordHash`)
- [x] Зарегистрировать handler в массиве `Handlers` `users.module.ts`
- [x] Реэкспортировать `GetUserByIdQuery` из `apps/backend/src/users/index.ts`

### 4. Декоратор `@CurrentUser`
- [x] Создать `apps/backend/src/auth/decorators/current-user.decorator.ts` (`createParamDecorator`, возвращает `JwtAccessPayload`)

### 5. Модуль Categories — структура
- [x] Создать каталог `apps/backend/src/categories/`
- [x] `domain/category.entity.ts` — тип `PublicCategory`
- [x] `domain/errors.ts` — `CategoryNotFoundError`, `CategoryNameTakenError`, `OwnerNotFoundError`
- [x] `dto/create-category.dto.ts` — class-validator (`@IsString`, `@MinLength`, `@MaxLength`, `@Matches(/^#[0-9a-fA-F]{6}$/)` для color)
- [x] `dto/update-category.dto.ts` — `PartialType(CreateCategoryDto)` из `@nestjs/mapped-types`
- [x] `index.ts` — публичный API модуля

### 6. CategoriesService
- [x] Внедрить `PrismaService` и `QueryBus`
- [x] `create(userId, dto)` — `GetUserByIdQuery` → `OwnerNotFoundError`; `prisma.category.create`; ловить `P2002` → `CategoryNameTakenError`
- [x] `findAllForUser(userId)` — `findMany({ where: { userId }, orderBy: { createdAt: 'asc' } })`
- [x] `update(userId, id, dto)` — `findFirst({ where: { id, userId } })` → `CategoryNotFoundError`; `update`; ловить `P2002`
- [x] `remove(userId, id)` — проверка владельца, `delete`
- [x] Использовать `select` для возврата `PublicCategory` без лишних полей

### 7. CategoriesController
- [x] `@UseGuards(JwtAuthGuard)` на класс
- [x] `POST /categories` (201) — `CreateCategoryDto`
- [x] `GET /categories` — список юзера
- [x] `PATCH /categories/:id` — `UpdateCategoryDto`
- [x] `DELETE /categories/:id` — `@HttpCode(204)`
- [x] Извлекать userId через `@CurrentUser() user: JwtAccessPayload` (`user.sub`)
- [x] Маппинг доменных ошибок: `OwnerNotFoundError → UnauthorizedException`, `CategoryNotFoundError → NotFoundException`, `CategoryNameTakenError → ConflictException`

### 8. CategoriesModule и подключение
- [x] `categories.module.ts` — `imports: [CqrsModule]`, `controllers: [CategoriesController]`, `providers: [CategoriesService]`
- [x] Добавить `CategoriesModule` в `imports` `app.module.ts`

### 9. Проверки
- [x] `npm run type-check --workspace=backend` — без ошибок
- [x] `npm run lint` — pre-existing проблема (ESLint v9 без конфига), не связана с задачей
- [x] cURL-сценарии:
  - [x] Без токена `GET /categories` → 401
  - [x] `POST /categories` с валидным body → 201
  - [x] Повторный POST с тем же `name` → 409
  - [x] `GET /categories` → массив текущего юзера
  - [x] `PATCH /categories/:id` несуществующего id → 404
  - [x] `DELETE /categories/:id` → 204; повторный → 404
  - [x] Невалидный body (пустой `name`, неверный hex `color`) → 400
- [x] В коде `categories/` нет прямого обращения к таблице `user` через Prisma — только через `QueryBus`

---

## Критические файлы

- `prisma/schema.prisma`
- `apps/backend/src/users/queries/get-user-by-id.query.ts` (new)
- `apps/backend/src/users/queries/handlers/get-user-by-id.handler.ts` (new)
- `apps/backend/src/users/users.module.ts`
- `apps/backend/src/users/index.ts`
- `apps/backend/src/auth/decorators/current-user.decorator.ts` (new)
- `apps/backend/src/categories/**` (new)
- `apps/backend/src/app.module.ts`
- `packages/shared/src/index.ts`

## Переиспользуемые элементы

- `JwtAuthGuard` — `apps/backend/src/auth/guards/jwt-auth.guard.ts`
- `JwtAccessPayload` — `apps/backend/src/auth/strategies/jwt.strategy.ts`
- `PrismaService` (глобальный) — `apps/backend/src/prisma/prisma.service.ts`
- Глобальная `ValidationPipe` уже настроена в `main.ts`
- Стиль CQRS-handlers и domain-ошибок — `users/queries/handlers/get-user-by-email.handler.ts`, `users/domain/errors.ts`
