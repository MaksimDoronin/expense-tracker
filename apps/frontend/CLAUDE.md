## Архитектура фронтенда — Feature Slice Design (FSD)

Фронтенд следует методологии [Feature Slice Design](https://feature-sliced.design/). Слои сверху вниз (вышестоящие слои могут импортировать только из нижестоящих):

```
src/
  app/                        # Next.js App Router — роутинг, глобальные провайдеры, глобальные стили
    layout.tsx                # корневой layout, подключает AuthProvider
    page.tsx                  # главная страница: редирект на /login если не аутентифицирован
    providers.tsx             # обёртка AuthProvider для client-компонентов
    (auth)/
      layout.tsx              # layout для страниц авторизации (центрирование)
      login/page.tsx
      register/page.tsx
  features/                   # Самодостаточные фича-слайсы
    auth/
      api/
        auth.api.ts           # authApi.login(), authApi.register() → POST /auth/*
      model/
        auth.context.tsx      # AuthProvider, useAuth() хук
        use-login.ts          # react-hook-form + zod + authApi.login
        use-register.ts       # react-hook-form + zod + authApi.register
      ui/
        login-form.tsx        # форма входа
        register-form.tsx     # форма регистрации
  shared/                     # Переиспользуемые, проекто-независимые блоки
    api/
      client.ts               # apiRequest<T>() — базовый fetch-клиент
    lib/
      utils.ts                # cn() — объединение Tailwind-классов (clsx + tailwind-merge)
    types/
      auth.ts                 # AuthUser, AuthResult, LoginInput, RegisterInput
    ui/                       # shadcn/ui компоненты: Button, Input, Label, Card
```

**Правила:**
- `features/*` может импортировать только из `shared` — кросс-фича-импорты запрещены.
- `app/` может импортировать из `features` и `shared`.
- Новые общие UI-компоненты добавляются в `src/shared/ui/` по паттерну shadcn/ui (CVA + `cn`).
- Алиас `@/*` указывает на `src/*`.

## Аутентификация

- JWT `accessToken` хранится в `localStorage` под ключом `access_token`.
- `AuthProvider` (`features/auth/model/auth.context.tsx`) предоставляет через `useAuth()`:
  - `user: AuthUser | null`
  - `token: string | null`
  - `isAuthenticated: boolean`
  - `setAuth(result: AuthResult): void`
  - `logout(): void`
- Главная страница (`app/page.tsx`) делает `router.replace('/login')` если `!isAuthenticated`.
- Для передачи токена в запросы использовать заголовок `Authorization: Bearer <token>` через `apiRequest` с `options.headers`.
- Восстановление пароля не реализовано.

## HTTP-клиент

`shared/api/client.ts` — функция `apiRequest<T>(path, options?)`:
- Базовый URL: `process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'`
- Автоматически добавляет `Content-Type: application/json`
- При `!res.ok` кидает `Error` с сообщением из тела ответа (поле `message`)
- Поддерживает массив сообщений от `class-validator` (соединяет через `\n`)

## Формы

Все формы используют `react-hook-form` + `zod` (через `@hookform/resolvers/zod`):
1. Определить `z.object({...})` схему валидации
2. `useForm<FormValues>({ resolver: zodResolver(schema) })`
3. Ошибки сервера хранятся в локальном `useState<string | null>`

## UI-компоненты

Настройка shadcn/ui: компоненты добавляются вручную в `src/shared/ui/`. CSS design tokens объявляются в `globals.css` через `@theme inline` (совместимо с Tailwind v4).

Доступные компоненты: `Button`, `Input`, `Label`, `Card` (+ `CardHeader`, `CardContent` и т.д.)

Иконки: `lucide-react`.

## Переменные окружения

| Переменная            | Описание                                      |
|-----------------------|-----------------------------------------------|
| `NEXT_PUBLIC_API_URL` | Базовый URL бэкенда (по умолчанию: `http://localhost:3001`) |

## Роутинг

| Путь        | Описание                                       |
|-------------|------------------------------------------------|
| `/`         | Главная (требует авторизации, иначе → `/login`) |
| `/login`    | Страница входа                                  |
| `/register` | Страница регистрации                            |
