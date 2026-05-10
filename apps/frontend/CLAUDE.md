## Архитектура фронтенда — Feature Slice Design (FSD)

Фронтенд следует методологии [Feature Slice Design](https://feature-sliced.design/). Слои сверху вниз (вышестоящие слои могут импортировать только из нижестоящих):

```
src/
  app/                              # Next.js App Router — роутинг, глобальные провайдеры, стили
    layout.tsx                      # корневой layout, подключает AuthProvider
    providers.tsx                   # обёртка AuthProvider для client-компонентов
    globals.css                     # CSS design tokens (@theme inline, Tailwind v4)
    (auth)/                         # group: страницы без навигации
      layout.tsx                    # центрирующий layout для форм
      login/page.tsx
      register/page.tsx
    (app)/                          # group: защищённые страницы с боковой панелью
      layout.tsx                    # оборачивает в <RequireAuth> + <Sidebar>
      page.tsx                      # дашборд: SummaryStats + RecentTransactions
      transactions/page.tsx
      categories/page.tsx
      profile/page.tsx
      _components/                  # приватные компоненты layout-а (не переиспользуются)
        sidebar.tsx
        sidebar-nav.tsx
        sidebar-user.tsx
        summary-stats.tsx
  features/                         # самодостаточные фича-слайсы
    auth/
      api/
        auth.api.ts                 # authApi: login(), register(), me()
      model/
        auth.context.tsx            # AuthProvider, useAuth()
        use-login.ts                # react-hook-form + zod + authApi.login
        use-register.ts             # react-hook-form + zod + authApi.register
        use-current-user.ts         # обёртка над useAuth() → { user, isLoading }
      ui/
        login-form.tsx
        register-form.tsx
        require-auth.tsx            # Guard-компонент: редирект или спиннер
    categories/
      api/
        categories.api.ts           # categoriesApi: list()
      model/
        use-categories-map.ts       # хук → Map<id, Category>
    transactions/
      api/
        transactions.api.ts         # transactionsApi: list(), create()
      model/
        use-transactions.ts         # хук: список, пагинация, refresh
        format.ts                   # утилиты форматирования сумм/дат
      ui/
        recent-transactions.tsx
        transaction-list-item.tsx
        create-transaction-dialog.tsx
  shared/                           # переиспользуемые, проекто-независимые блоки
    api/
      client.ts                     # apiRequest<T>(), ApiError
    lib/
      auth-storage.ts               # authStorage: read/save/clear (localStorage)
      utils.ts                      # cn() — объединение Tailwind-классов
    types/
      auth.ts                       # AuthUser, AuthResult, LoginInput, RegisterInput
    ui/                             # shadcn/ui компоненты
      Button, Input, Label, Card, Dialog, Avatar, Skeleton
```

**Правила:**
- `features/*` может импортировать только из `shared` и `@expense-tracker/shared` — кросс-фича-импорты запрещены.
- `app/` может импортировать из `features` и `shared`.
- `_components/` внутри `app/(app)/` — приватные компоненты route-сегмента, не переиспользуются в других слоях.
- Новые общие UI-компоненты добавляются в `src/shared/ui/` по паттерну shadcn/ui (CVA + `cn`).
- Алиас `@/*` указывает на `src/*`.

## Аутентификация

**Хранение токена:** `authStorage` (`shared/lib/auth-storage.ts`) — обёртка над `localStorage` с SSR-защитой (`typeof window === 'undefined'`). Ключ: `access_token`.

**`AuthProvider`** (`features/auth/model/auth.context.tsx`) предоставляет через `useAuth()`:

| Поле            | Тип               | Описание                                      |
|-----------------|-------------------|-----------------------------------------------|
| `user`          | `AuthUser \| null` | Данные текущего пользователя                  |
| `token`         | `string \| null`  | JWT accessToken                               |
| `isAuthenticated` | `boolean`       | `!!token`                                     |
| `isLoadingUser` | `boolean`         | `true` пока идёт запрос `GET /auth/me`        |
| `setAuth`       | `(AuthResult) => void` | Сохраняет токен и данные пользователя    |
| `logout`        | `() => void`      | Очищает токен и состояние                     |

**Восстановление сессии:** при монтировании `AuthProvider` читает токен из `authStorage` и делает `GET /auth/me` для получения данных пользователя. Пока запрос не завершён — `isLoadingUser: true`.

**Автоматический логаут:** при ответе `401` от любого запроса `apiRequest` очищает `authStorage` и диспатчит событие `auth:logout` — `AuthProvider` слушает это событие и вызывает `logout()`.

**`RequireAuth`** (`features/auth/ui/require-auth.tsx`) — Guard-компонент:
- Пока `isLoadingUser` — показывает спиннер.
- Если `!isAuthenticated` — делает `router.replace('/login')` и рендерит `null`.
- Используется в `app/(app)/layout.tsx` для защиты всех страниц приложения.

**`useCurrentUser()`** — тонкая обёртка: `{ user, isLoading }` из `useAuth()`.

**Восстановление пароля не реализовано.**

## HTTP-клиент (`shared/api/client.ts`)

Функция `apiRequest<T>(path, options?)`:
- Базовый URL: `process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'`
- Автоматически добавляет `Content-Type: application/json`
- Автоматически добавляет `Authorization: Bearer <token>` из `authStorage` (если токен есть и заголовок не передан вручную)
- При `401` — очищает хранилище и диспатчит `auth:logout`
- При `!res.ok` — кидает `ApiError(message, status)` с сообщением из тела (`body.message`; массив join через `\n`)
- При `204` — возвращает `undefined as T`

`ApiError extends Error` — добавляет поле `status: number`.

## Формы

Все формы используют `react-hook-form` + `zod` (через `@hookform/resolvers/zod`):
1. Определить `z.object({...})` схему валидации
2. `useForm<FormValues>({ resolver: zodResolver(schema) })`
3. Ошибки сервера хранятся в локальном `useState<string | null>`

## Хуки данных

| Хук                  | Файл                                           | Возвращает                                              |
|----------------------|------------------------------------------------|---------------------------------------------------------|
| `useTransactions()`  | `features/transactions/model/use-transactions` | `{ items, visibleItems, hasMore, loadMore, isLoading, error, refresh }` |
| `useCategoriesMap()` | `features/categories/model/use-categories-map` | `{ categories: Map<id, Category>, isLoading }`         |
| `useCurrentUser()`   | `features/auth/model/use-current-user`         | `{ user, isLoading }`                                  |

`useTransactions` поддерживает клиентскую пагинацию (`PAGE_SIZE = 10`) и `refresh()` через `reloadKey`.

## UI-компоненты (`shared/ui`)

Настройка shadcn/ui: компоненты добавляются вручную. CSS design tokens — в `globals.css` через `@theme inline` (Tailwind v4).

Доступные компоненты: `Button`, `Input`, `Label`, `Card`, `Dialog`, `Avatar`, `Skeleton`.

Иконки: `lucide-react`.

## Роутинг

| Путь              | Защита        | Описание                        |
|-------------------|---------------|---------------------------------|
| `/`               | RequireAuth   | Дашборд (последние операции)    |
| `/transactions`   | RequireAuth   | Список транзакций               |
| `/categories`     | RequireAuth   | Управление категориями          |
| `/profile`        | RequireAuth   | Профиль пользователя            |
| `/login`          | —             | Форма входа                     |
| `/register`       | —             | Форма регистрации               |

## Переменные окружения

| Переменная            | Описание                                                    |
|-----------------------|-------------------------------------------------------------|
| `NEXT_PUBLIC_API_URL` | Базовый URL бэкенда (по умолчанию: `http://localhost:3001`) |
