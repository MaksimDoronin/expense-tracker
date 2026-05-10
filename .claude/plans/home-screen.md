# План: главный экран Expense Tracker

## Context

После авторизации пользователя на `/login` он попадает на `/` — сейчас это пустая страница-заглушка с редиректом неавторизованных на `/login` (`apps/frontend/src/app/page.tsx`). Нужен полноценный главный экран:

- меню с переходом на `/transactions` и `/categories`,
- блок профиля с именем пользователя,
- список последних транзакций с пагинацией «Загрузить ещё» по 10 штук.

Дополнительно: `AuthProvider` хранит `user` только в памяти и теряет его при refresh (`auth.context.tsx:22`). Чтобы имя на главном экране переживало перезагрузку, добавляем `GET /auth/me` и подтягиваем профиль на старте приложения. Пагинация — фронтовая (по решению пользователя backend не трогаем).

Фичи `transactions` и `categories` на фронте сейчас отсутствуют — их нужно завести по FSD. Страницы `/transactions` и `/categories` создаём как заглушки (полная реализация — отдельные задачи), чтобы навигация работала.

## Чек-лист задач

### Backend

- [x] Добавить метод `getMe(userId)` в `apps/backend/src/auth/auth.service.ts` (через существующий `GetUserByIdQuery`).
- [x] Добавить эндпоинт `GET /auth/me` в `apps/backend/src/auth/auth.controller.ts` под `JwtAuthGuard` + `@CurrentUser()`. Ответ: `AuthUser` (`id`, `name`, `email`).

### Frontend — shared

- [x] Расширить `apps/frontend/src/shared/api/client.ts`: автоматически прикреплять `Authorization: Bearer <token>` из `localStorage`. На 401 — очищать токен и бросать ошибку.
- [x] Создать `apps/frontend/src/shared/ui/avatar.tsx` (инициалы) по паттерну shadcn (CVA + `cn`).
- [x] Создать `apps/frontend/src/shared/ui/skeleton.tsx` (плейсхолдер загрузки).

### Frontend — feature `auth`

- [x] В `features/auth/api/auth.api.ts` добавить `authApi.me()` → `GET /auth/me`.
- [x] В `features/auth/model/auth.context.tsx` рехидратировать `user` при наличии токена (вызов `authApi.me()` в `useEffect`); на 401 — `logout()`.
- [x] Создать `features/auth/model/use-current-user.ts` — `{ user, isLoading }`.
- [x] Создать `features/auth/ui/require-auth.tsx` — guard-компонент с редиректом неавторизованных на `/login`.

### Frontend — feature `transactions` (новая)

- [x] Создать `features/transactions/api/transactions.api.ts` — `transactionsApi.list()` → `Transaction[]`.
- [x] Создать `features/transactions/model/format.ts` — `formatAmount`, `formatDate` (локаль `ru-RU`).
- [x] Создать `features/transactions/model/use-transactions.ts` — загрузка списка + локальная пагинация (`visibleCount`, шаг 10): `{ items, visibleItems, hasMore, loadMore, isLoading, error }`.
- [x] Создать `features/transactions/ui/transaction-list-item.tsx` — строка списка (дата, категория, сумма со знаком).
- [x] Создать `features/transactions/ui/recent-transactions.tsx` — карточка списка + кнопка «Загрузить ещё» + скелетоны + пустое состояние.

### Frontend — feature `categories` (новая)

- [x] Создать `features/categories/api/categories.api.ts` — `categoriesApi.list()` → `Category[]`.
- [x] Создать `features/categories/model/use-categories-map.ts` — возвращает `Map<id, Category>` для подстановки в строку транзакции.

### App Router co-located components (вместо feature `home`)

> FSD-правило «features/* импортируют только из shared» делает кросс-фичевую композицию через `features/home` некорректной. Композиция перенесена в `app/_components/home/` (приватная папка App Router), которая по правилам FSD относится к слою `app` и может импортировать из любых features.

- [x] Создать `app/_components/home/home-header.tsx` — приветствие, `Avatar` с инициалами, кнопка `Выйти`.
- [x] Создать `app/_components/home/home-nav.tsx` — две карточки-ссылки на `/transactions` и `/categories` (через `next/link`).
- [x] Создать `app/_components/home/home-screen.tsx` — композиция `HomeHeader`, `HomeNav`, `RecentTransactions`.

### Frontend — App Router

- [x] Обновить `apps/frontend/src/app/page.tsx` — рендер `<HomeScreen />` с guard'ом.
- [x] Создать `apps/frontend/src/app/transactions/page.tsx` — заглушка с guard'ом.
- [x] Создать `apps/frontend/src/app/categories/page.tsx` — заглушка с guard'ом.

### Verification (требует ручного запуска)

- [ ] `npm run db:up`, `npm run dev:backend`, `npm run dev:frontend`.
- [ ] `npm run prisma:generate` (если требуется).
- [ ] Логин/регистрация → главный экран показывает имя, меню и список транзакций.
- [ ] Создать ≥ 15 транзакций → отображается 10, «Загрузить ещё» догружает остальные, кнопка исчезает на последней пачке.
- [ ] Refresh при валидном токене — имя сохраняется (через `/auth/me`).
- [ ] `logout()` или удаление токена → редирект на `/login`.
- [x] `npm run type-check --workspace=backend` — без ошибок.
- [ ] `npm run type-check --workspace=frontend` — на момент задачи существует пред-существующая ошибка в `features/auth/model/use-register.ts:18` (zod v4 API), не связанная с этой задачей.
- [ ] Клики по «Транзакции» и «Категории» открывают страницы-заглушки.
