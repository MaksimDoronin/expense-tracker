# План устранения замечаний код-ревью

Документ описывает поэтапный план исправлений по итогам ревью на безопасность, качество кода, FSD и общие архитектурные принципы. Этапы упорядочены по приоритету: сначала безопасность и мёртвый код, затем рефакторинг архитектуры, затем функциональные пробелы.

---

## Этап 1. Безопасность (критично)

**Цель:** закрыть очевидные дыры до любого внешнего деплоя.

### 1.1. Секреты и `.env`
- Удалить `.env` из репозитория: `git rm --cached .env`, добавить `.env` в `.gitignore`.
- Сгенерировать сильный `JWT_SECRET` (≥32 байта, `openssl rand -base64 48`), хранить вне репозитория.
- В `apps/backend/src/auth/auth.module.ts` добавить валидацию длины секрета: бросать ошибку при старте, если `JWT_SECRET.length < 32`.
- Обновить `.env.example` без реальных значений, с пояснением требований.

### 1.2. CORS
- В `main.ts:11` заменить `origin: true` на список из ENV: `CORS_ORIGINS` (CSV → массив).
- В dev оставить `http://localhost:3000`, в prod — список доменов фронта.

### 1.3. Helmet и rate-limit
- Добавить зависимость `helmet`, подключить `app.use(helmet())` в `main.ts`.
- Добавить `@nestjs/throttler`:
  - глобальный лимит (например, 100 req/min на IP);
  - усиленный лимит на `/auth/login` и `/auth/register` (5 req/min на IP).

### 1.4. Auth-усиления
- `bcrypt`: вынести `cost` в ENV (`BCRYPT_ROUNDS`, дефолт 12).
- `auth.service.login`: при `!found` всё равно выполнять `bcrypt.compare` с фиктивным хэшем — устранение timing-attack на user enumeration.
- `auth.service.register`: бросать тот же `UnauthorizedException` или generic `BadRequestException` без указания «email already exists» (или возвращать одинаковую структуру). Альтернатива: оставить 409, но прикрыть rate-limit'ом.
- `JwtStrategy.validate`: опционально проверять, что user всё ещё существует (через `GetUserByIdQuery`) для критичных эндпоинтов — реализовать через отдельный guard `JwtFreshAuthGuard`, не нагружая обычные.

### 1.5. Хранение токена на фронте
- Перевести access-token в httpOnly secure cookie + добавить refresh-token (отдельный endpoint `/auth/refresh`).
- Альтернативный минимальный шаг (если cookie не подходит сейчас): добавить refresh-механизм поверх localStorage и автоматическое продление в `apiRequest`.
- По итогу убрать чтение токена из `localStorage` в `apiRequest` и `auth.context.tsx`.

**Артефакты этапа:** обновлённые `main.ts`, `auth.module.ts`, `auth.service.ts`, `.env.example`, `.gitignore`, новые модули `throttler` и (опционально) `refresh-token`.

---

## Этап 2. Удаление мёртвого кода и заглушек

**Цель:** убрать «полусделанные» куски, чтобы кодовая база отражала реальность.

- Удалить модель `Expense` из `prisma/schema.prisma`, создать миграцию `drop_expense_table`.
- Удалить связанные типы `Expense`, `CreateExpenseInput`, `Currency` из `packages/shared/src/index.ts`, если они нигде не используются (проверить).
- Удалить `apps/backend/src/app.controller.ts`, `app.service.ts` и упоминания в `app.module.ts` (или оставить только health-check `/healthz`).
- Удалить `apps/frontend/src/shared/types/auth.ts` — все типы переехали в `@expense-tracker/shared`.
- Заменить `SummaryStats` (`apps/frontend/src/app/(app)/_components/summary-stats.tsx`) на компонент, использующий реальный endpoint `/transactions/summary` (см. этап 5), либо временно скрыть.
- Заменить заглушку `app/(app)/categories/page.tsx` на реальный CRUD UI (см. этап 5).

---

## Этап 3. Унификация архитектуры бэкенда

**Цель:** убрать несогласованность между `transactions/` (CQRS) и `categories/` (плоский сервис), упростить до уровня, адекватного размеру проекта.

**Решение:** отказаться от CQRS — для CRUD-приложения этого масштаба CQRS даёт boilerplate без выгоды. Заменить на классическую схему `Controller → Service → Repository (Prisma)`.

### 3.1. Рефакторинг transactions
- Удалить директории `commands/`, `queries/`, оставить `transactions.service.ts` с прямыми вызовами Prisma.
- Перенести логику из handler'ов в `transactions.service` (методы `create`, `update`, `delete`, `findOne`, `findAll`, `getSummary`).
- Исправить unsafe cast в `transactions.service.update` (`dto as CreateTransactionDto` → использовать `dto` напрямую с учётом `Partial<>`).
- Переход на `updateMany`/`deleteMany` с compound where (`{ id, userId }`) для атомарной проверки владельца — устраняет race и второй запрос.

### 3.2. Рефакторинг users
- Аналогично: удалить CQRS, оставить `users.service` (используется только из `auth.service`).

### 3.3. Глобальный exception filter
- Создать `apps/backend/src/common/filters/domain-exception.filter.ts`:
  - `*NotFoundError → NotFoundException`,
  - `*TakenError / EmailAlreadyExists → ConflictException`,
  - `OwnerNotFoundError → UnauthorizedException`.
- Зарегистрировать через `app.useGlobalFilters(...)` в `main.ts`.
- Удалить try/catch блоки из всех контроллеров (`transactions.controller.ts`, `categories.controller.ts`, `auth.controller.ts`).

### 3.4. Логирование
- Заменить `console.log` в `main.ts` на `Logger` из `@nestjs/common`.
- Добавить глобальный `Logger` middleware/interceptor для request-логов (опционально).

### 3.5. Глобальный префикс
- `app.setGlobalPrefix('api')` в `main.ts`. Обновить `NEXT_PUBLIC_API_URL` дефолт.

---

## Этап 4. Frontend FSD и рефакторинг

**Цель:** привести структуру к FSD, убрать кросс-feature-связи через введение `entities/` и `widgets/`.

### 4.1. Новые слои
- Завести слой `entities/`:
  - `entities/transaction/`: типы (re-export из shared), `ui/transaction-list-item.tsx` (перенос из `features/transactions/ui/`).
  - `entities/category/`: `ui/category-badge.tsx`, при необходимости.
- Завести слой `widgets/`:
  - `widgets/sidebar/` — перенос `app/(app)/_components/sidebar*.tsx`.
  - `widgets/recent-transactions/` — перенос из `features/transactions/ui/recent-transactions.tsx` (поскольку компонент комбинирует transactions + categories).
  - `widgets/summary-stats/` — реальный компонент с данными `/transactions/summary`.

### 4.2. Устранение дублирования и кросс-импортов
- Удалить `apps/frontend/src/shared/types/auth.ts`, импортировать из `@expense-tracker/shared`.
- Вынести константу `TOKEN_KEY` и работу с токеном в `shared/lib/auth-storage.ts`, использовать в `client.ts` и `auth.context.tsx`.
- `apiRequest` при 401 должен уведомлять `AuthProvider` (через CustomEvent или вынесенный store), чтобы контекст синхронно становился `unauthenticated`.

### 4.3. Сетевой слой и state
- Подключить `@tanstack/react-query`:
  - заменить ручные `useEffect+fetch+isLoading` в `useTransactions`, `useCategoriesMap`, `auth.context.tsx` (для `me`).
  - реализовать invalidation вместо `reloadKey`.
- Добавить серверную пагинацию: `transactionsApi.list({ limit, offset })`, обновить бэкенд `ListTransactionsQueryDto`.

### 4.4. RequireAuth
- Учитывать `isLoadingUser`: пока идёт `me()`, показывать loader, не редиректить.
- При ошибке валидации токена редиректить на `/login` с возвратом на текущий путь.

---

## Этап 5. Доделать функциональность

**Цель:** перевести «полусделанные» фичи в рабочее состояние.

### 5.1. Категории на фронте
- `categoriesApi`: добавить `create`, `update`, `delete`.
- Страница `app/(app)/categories/page.tsx`: список, форма создания (имя, цвет, иконка), редактирование, удаление.

### 5.2. Транзакции на фронте
- `transactionsApi`: добавить `update`, `remove`, `getOne`, `summary`.
- UI: редактирование (диалог), удаление (с подтверждением), фильтры (тип, диапазон дат, категория) — соответствуют `ListTransactionsQueryDto`.

### 5.3. Сводка
- Виджет `widgets/summary-stats` использует `/transactions/summary?month=&year=` для текущего месяца, с переключателем месяца.

---

## Этап 6. Тесты

**Цель:** покрыть критичные слои.

- Unit:
  - `auth.service`: register/login/getMe (хеширование, отказы, ошибки).
  - `transactions.service`: ownership-проверки в `update`/`delete`/`findOne`.
  - `categories.service`: уникальность имени, ownership.
- E2E (`@nestjs/testing` + `supertest`):
  - happy-path register → login → create category → create transaction → list → summary.
  - 401 без токена, 403 при чужом ресурсе (cross-user access denied).
- Frontend:
  - smoke-тест на формы (login, register, create-transaction) через React Testing Library.

---

## Этап 7. Observability и DX

- `Logger` из `@nestjs/common` вместо `console.*` (см. 3.4).
- Корреляционный ID в каждом запросе (`x-request-id`), пробрасывать в логи.
- `prisma:studio` и health-check `/healthz`.
- Pre-commit hook (`husky` + `lint-staged`): `eslint`, `prettier`, `tsc --noEmit` на staged-файлах.
- CI (GitHub Actions): lint, format-check, type-check, тесты, prisma migrate deploy на PR.

---

## Рекомендуемый порядок выполнения

1. **Сначала**: этап 1 (безопасность) + 2 (мёртвый код) — это можно сделать одним PR без архитектурных изменений.
2. **Затем**: этап 3 (унификация бэкенда) — отдельный PR, ломает внутреннюю структуру, но не публичный API.
3. **Параллельно**: этап 4 (FSD-рефакторинг фронта).
4. **Потом**: этап 5 (доделать UI), этап 6 (тесты), этап 7 (CI/observability).

Каждый этап — отдельная ветка по соглашению `refactor/<scope>` или `feat/<scope>` с PR в `main`.
