# CLAUDE.md

Этот файл содержит инструкции для Claude Code (claude.ai/code) при работе с данным репозиторием.

## Архитектура

Монорепозиторий на npm workspaces, состоящий из трёх пакетов:

- `apps/backend` — NestJS API, работает на порту 3001 (настраивается через `BACKEND_PORT`)
- `apps/frontend` — приложение на Next.js 16 / React 19, работает на порту 3000
- `packages/shared` — общие TypeScript-типы (`Expense`, `CreateExpenseInput`, `Currency`), используемые обоими приложениями через алиас `@expense-tracker/shared`

Prisma-клиент и схема находятся в корне репозитория (`prisma/schema.prisma`). Единственная модель `Expense` использует PostgreSQL (управляется через Docker). `DATABASE_URL` и другие переменные окружения загружаются из `.env` в корне репозитория; бэкенд также проверяет свой локальный `.env`.

Алиас `@expense-tracker/shared` указывает на `packages/shared/src/index.ts` (определён в `tsconfig.base.json`), который расширяют оба приложения.

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

Сборка отдельного воркспейса:
```bash
npm run build --workspace=backend
```

## Архитектура фронтенда — Feature Slice Design (FSD)

Фронтенд следует методологии [Feature Slice Design](https://feature-sliced.design/). Слои сверху вниз (вышестоящие слои могут импортировать только из нижестоящих):

```
src/
  app/          # Next.js App Router — роутинг, глобальные провайдеры, глобальные стили
  features/     # Самодостаточные фича-слайсы
    auth/
      api/      # API-вызовы (authApi)
      model/    # Состояние и бизнес-логика (AuthProvider, useLogin, useRegister)
      ui/       # React-компоненты (LoginForm, RegisterForm)
  shared/       # Переиспользуемые, проекто-независимые блоки
    api/        # Базовый HTTP-клиент (apiRequest)
    lib/        # Утилиты (cn)
    types/      # Общие TypeScript-интерфейсы (AuthUser, AuthResult, …)
    ui/         # shadcn/ui компоненты (Button, Input, Label, Card)
```

**Правила:**
- `features/*` может импортировать только из `shared` — кросс-фича-импорты запрещены.
- `app/` может импортировать из `features` и `shared`.
- Новые общие UI-компоненты добавляются в `src/shared/ui/` по паттерну shadcn/ui (CVA + `cn`).
- Алиас `@/*` указывает на `src/*`.

**Настройка shadcn/ui:** компоненты добавляются вручную в `src/shared/ui/`. CSS design tokens объявляются в `globals.css` через `@theme inline` (совместимо с Tailwind v4).

**Аутентификация:** JWT `accessToken` хранится в `localStorage` под ключом `access_token`. `AuthProvider` (в `features/auth/model/auth.context.tsx`) предоставляет `isAuthenticated`, `setAuth` и `logout` через хук `useAuth()`.

**Переменные окружения:**
- `NEXT_PUBLIC_API_URL` — базовый URL бэкенда (по умолчанию: `http://localhost:3001`)

## Ключевые соглашения

- **Строгий TypeScript**: в `tsconfig.base.json` включены `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`.
- **Общие типы в первую очередь**: любой тип, используемый и во фронтенде, и в бэкенде, должен находиться в `packages/shared/src/index.ts`, а не дублироваться в каждом приложении.
- **Prisma в корне**: схема и миграции находятся в `prisma/` в корне репозитория, а не внутри бэкенд-приложения.
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

**Примеры:**

```
feat(transactions): add income/expense tracking module
fix(auth): handle expired JWT token on refresh
refactor(categories): extract domain errors to separate file
chore(prisma): add transactions migration
docs(claude): add commit convention rules
```

**Правила:**
- `description` — в нижнем регистре, без точки в конце, на **русском языке**
- Один коммит = одна логическая единица изменений
- Breaking changes помечаются `!` после типа: `feat(api)!: rename endpoint`
