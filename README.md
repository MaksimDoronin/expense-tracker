# Expense Tracker

Fullstack-приложение для учёта личных финансов: доходов, расходов и категорий.

## Стек

| Слой       | Технологии                                                              |
|------------|-------------------------------------------------------------------------|
| Frontend   | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, react-hook-form, Zod |
| Backend    | NestJS 10, CQRS (`@nestjs/cqrs`), Passport JWT, Swagger                |
| База данных | PostgreSQL 16, Prisma ORM 5                                            |
| Инфраструктура | Docker Compose, npm workspaces                                     |
| Общие типы | `@expense-tracker/shared` (TypeScript, монорепо-пакет)                  |

## Требования

- Node.js ≥ 20
- Docker (для PostgreSQL)
- npm ≥ 10

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Переменные окружения

```bash
cp .env.example .env
```

Отредактируйте `.env` при необходимости. Значения по умолчанию работают с Docker-конфигурацией из репозитория:

| Переменная             | Значение по умолчанию                                              | Описание                         |
|------------------------|--------------------------------------------------------------------|----------------------------------|
| `DATABASE_URL`         | `postgresql://expense:expense@localhost:5432/expense_tracker`     | PostgreSQL connection string     |
| `BACKEND_PORT`         | `3001`                                                             | Порт NestJS-сервера              |
| `JWT_ACCESS_SECRET`    | `change-me-access`                                                 | Секрет для access-токена         |
| `JWT_REFRESH_SECRET`   | `change-me-refresh`                                                | Секрет для refresh-токена        |
| `JWT_ACCESS_TTL`       | `15m`                                                              | Время жизни access-токена        |
| `JWT_REFRESH_TTL`      | `7d`                                                               | Время жизни refresh-токена       |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:3001`                                            | URL бэкенда для фронтенда        |

> В продакшене замените секреты JWT на случайные строки.

### 3. База данных

```bash
npm run db:up           # запустить PostgreSQL через Docker
npm run prisma:migrate  # применить миграции
npm run prisma:generate # сгенерировать Prisma-клиент
```

### 4. Dev-серверы

Запустить в двух терминалах:

```bash
npm run dev:backend     # NestJS на http://localhost:3001
npm run dev:frontend    # Next.js на http://localhost:3000
```

Swagger-документация API доступна по адресу `http://localhost:3001/api`.

## Структура проекта

```
expense-tracker/
├── apps/
│   ├── backend/                  # NestJS API
│   │   └── src/
│   │       ├── auth/             # Регистрация, вход, JWT-стратегия
│   │       ├── categories/       # CRUD категорий
│   │       ├── transactions/     # CQRS: команды и запросы транзакций
│   │       ├── users/            # CQRS: пользователи
│   │       ├── prisma/           # PrismaModule + PrismaService
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── frontend/                 # Next.js (Feature Slice Design)
│       └── src/
│           ├── app/              # App Router: роуты, layout-ы, провайдеры
│           ├── features/         # Фича-слайсы: auth, categories, transactions
│           └── shared/           # UI-компоненты, HTTP-клиент, утилиты
├── packages/
│   └── shared/                   # Общие TypeScript-типы
│       └── src/index.ts
├── prisma/
│   ├── schema.prisma             # Схема БД
│   └── migrations/
├── docker-compose.yml
├── package.json                  # Корневой workspace
└── .env.example
```

## API Endpoints

Все защищённые маршруты требуют заголовка `Authorization: Bearer <accessToken>`.

### Auth `/auth`

| Метод | Путь             | Защита | Описание                                     |
|-------|------------------|--------|----------------------------------------------|
| POST  | `/auth/register` | —      | Регистрация → `{ user, tokens }`             |
| POST  | `/auth/login`    | —      | Вход → `{ user, tokens }`                   |
| GET   | `/auth/me`       | JWT    | Текущий пользователь → `PublicUser`          |

### Categories `/categories`

| Метод  | Путь               | Описание                         |
|--------|--------------------|----------------------------------|
| POST   | `/categories`      | Создать категорию                |
| GET    | `/categories`      | Список категорий текущего юзера  |
| PATCH  | `/categories/:id`  | Обновить категорию               |
| DELETE | `/categories/:id`  | Удалить категорию (204)          |

### Transactions `/transactions`

| Метод  | Путь                      | Описание                                    |
|--------|---------------------------|---------------------------------------------|
| POST   | `/transactions`           | Создать транзакцию                          |
| GET    | `/transactions`           | Список с фильтрацией (query params)         |
| GET    | `/transactions/summary`   | Сводка доходов/расходов по месяцу           |
| GET    | `/transactions/:id`       | Получить транзакцию по id                   |
| PATCH  | `/transactions/:id`       | Обновить транзакцию                         |
| DELETE | `/transactions/:id`       | Удалить транзакцию (204)                    |

## Основные команды

```bash
# Разработка
npm run dev:frontend        # Next.js на порту 3000
npm run dev:backend         # NestJS на порту 3001

# База данных
npm run db:up               # запустить PostgreSQL
npm run db:down             # остановить PostgreSQL
npm run prisma:migrate      # применить миграции
npm run prisma:generate     # обновить Prisma-клиент
npm run prisma:studio       # Prisma Studio

# Сборка и качество кода
npm run build               # собрать все воркспейсы
npm run lint                # линтинг
npm run format              # форматирование (Prettier)
npm run format:check        # проверка форматирования (CI)

# Проверка типов
npm run type-check --workspace=frontend
npm run type-check --workspace=backend
```
