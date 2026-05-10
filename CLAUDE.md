## Архитектура

Монорепозиторий на npm workspaces, состоящий из трёх пакетов:

- `apps/backend` — NestJS API, работает на порту 3001 (настраивается через `BACKEND_PORT`)
- `apps/frontend` — приложение на Next.js 16 / React 19, работает на порту 3000
- `packages/shared` — общие TypeScript-типы, используемые обоими приложениями через алиас `@expense-tracker/shared`

Prisma-клиент и схема находятся в корне репозитория (`prisma/schema.prisma`). PostgreSQL управляется через Docker. `DATABASE_URL` и другие переменные окружения загружаются из `.env` в корне; бэкенд также проверяет свой локальный `.env`.

Алиас `@expense-tracker/shared` указывает на `packages/shared/src/index.ts` (определён в `tsconfig.base.json`), который расширяют оба приложения.

## Схема базы данных

Модели Prisma (`prisma/schema.prisma`):

| Модель        | Назначение                                                              |
|---------------|-------------------------------------------------------------------------|
| `User`        | Пользователь: `id`, `name`, `email` (unique), `passwordHash`           |
| `Category`    | Категория расходов: `name`, `color`, `icon`, `userId`; unique по `(userId, name)` |
| `Transaction` | Транзакция: `amount` (Decimal 12,2), `type` (income/expense), `date`, `categoryId`, `userId` |
| `Expense`     | Устаревшая заготовка — не используется в бизнес-логике                  |

Enum `TransactionType`: `income` | `expense`.

Каскадное удаление: удаление `User` удаляет его `Category` и `Transaction`. Удаление `Category` запрещено (`Restrict`), если есть транзакции.

## Общие типы (`packages/shared/src/index.ts`)

| Экспорт                                              | Назначение                                      |
|------------------------------------------------------|-------------------------------------------------|
| `AuthUser`, `AuthTokens`, `AuthResponse`             | Ответы аутентификации                           |
| `LoginInput`, `RegisterInput`                        | Входные данные форм авторизации                 |
| `TransactionType`                                    | `'income' \| 'expense'`                         |
| `Transaction`                                        | Публичное представление транзакции              |
| `Category`, `CreateCategoryInput`, `UpdateCategoryInput` | Категории расходов                          |
| `Expense`, `CreateExpenseInput`, `Currency`          | Устаревшие — из первой итерации, не удалять     |

**Правило:** любой тип, используемый и во фронтенде, и в бэкенде, должен находиться в `packages/shared/src/index.ts`, а не дублироваться.

## Основные команды

Выполняются из корня репозитория, если не указано иное.

### Разработка
```bash
npm run db:up              # запустить Postgres через Docker
npm run dev:frontend       # dev-сервер Next.js (порт 3000)
npm run dev:backend        # NestJS в режиме watch (порт 3001)
```

### База данных
```bash
npm run prisma:migrate     # применить миграции (требует запущенной БД)
npm run prisma:generate    # перегенерировать Prisma-клиент после изменений схемы
npm run prisma:studio      # открыть Prisma Studio
npm run db:down            # остановить контейнер Postgres
```

### Сборка и линтинг
```bash
npm run build              # собрать все воркспейсы
npm run lint               # линтинг всех воркспейсов
npm run format             # форматирование через Prettier (ts, tsx, js, json, md)
npm run format:check       # проверка форматирования (CI)
```

Проверка типов отдельных приложений:
```bash
npm run type-check --workspace=frontend
npm run type-check --workspace=backend
```

## Ключевые соглашения

- **Строгий TypeScript**: в `tsconfig.base.json` включены `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`.
- **Общие типы в первую очередь**: любой тип, используемый и во фронтенде, и в бэкенде, должен находиться в `packages/shared/src/index.ts`.
- **Prisma в корне**: схема и миграции находятся в `prisma/` в корне, а не внутри бэкенд-приложения.
- **CORS**: бэкенд разрешает CORS для всех источников с учётными данными (`enableCors({ origin: true, credentials: true })`).

## Работа с ветками (GitHub Flow)

Проект следует [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow).

**Правила:**

- `main` — единственная постоянная ветка; всегда в рабочем состоянии и готова к деплою.
- Любая новая работа (фича, фикс, рефакторинг) ведётся в отдельной ветке, созданной от `main`.
- Имя ветки отражает тип и суть изменения: `<type>/<short-description>`.
- Ветка вливается в `main` только через Pull Request после ревью.
- После мерджа ветка удаляется.

**Формат имени ветки:**

```
<type>/<short-description>
```

Типы совпадают с типами коммитов: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `style`.

**Примеры:**

```
feat/home-screen
fix/auth-token-refresh
refactor/expense-list
chore/update-deps
```

## Создание Pull Request

PR создаётся через `gh pr create`. Перед созданием выполнить `git diff main...HEAD` для подготовки информативного описания.

**Структура описания:**

```markdown
## Что сделано
- краткий bullet-list изменений

## Новые API endpoints
- `METHOD /path` — что делает

## Test plan
- [ ] что проверить вручную
```

**Правила:**
- Title — по Conventional Commits: `feat(scope): описание на русском`.
- Base branch — всегда `main`.
- После создания PR вернуть URL пользователю.

**Пример:**

```bash
gh pr create \
  --title "feat(frontend): главный экран с транзакциями" \
  --base main \
  --body "$(cat <<'EOF'
## Что сделано
- добавлен защищённый layout

## Новые API endpoints
- `GET /auth/me` — текущий пользователь

## Test plan
- [ ] логин → главный экран
EOF
)"
```

## Соглашение о коммитах

Используется [Conventional Commits](https://www.conventionalcommits.org/). Формат:

```
<type>(<scope>): <description>
```

**Типы:**

| Тип        | Когда использовать                                      |
|------------|--------------------------------------------------------|
| `feat`     | Новая функциональность                                  |
| `fix`      | Исправление бага                                        |
| `refactor` | Рефакторинг без изменения поведения                     |
| `chore`    | Настройка инструментов, зависимости, конфиги            |
| `docs`     | Только документация                                     |
| `test`     | Добавление или исправление тестов                       |
| `perf`     | Улучшение производительности                            |
| `style`    | Форматирование, пробелы (не влияет на логику)           |

**Scope** — имя затронутого модуля или пакета: `backend`, `frontend`, `shared`, `prisma`, `auth`, `categories`, `transactions` и т.д. Можно опустить, если изменения глобальные.

**Правила:**
- `description` — в нижнем регистре, без точки в конце, на **русском языке**
- Один коммит = одна логическая единица изменений
- Breaking changes помечаются `!` после типа: `feat(api)!: rename endpoint`
