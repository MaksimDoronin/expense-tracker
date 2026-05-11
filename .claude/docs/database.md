# База данных

Движок: **PostgreSQL**, управляется через Docker. ORM: **Prisma**.

Схема: `prisma/schema.prisma` в корне репозитория.  
Клиент: генерируется в `node_modules/@prisma/client`, используется как `PrismaService` в бэкенде.

---

## Enum

### TransactionType

```prisma
enum TransactionType {
  income
  expense
}
```

---

## Модели

### User

Пользователь системы.

| Поле           | Тип       | Описание |
|----------------|-----------|----------|
| `id`           | String    | UUID, первичный ключ (`@default(uuid())`) |
| `name`         | String    | Отображаемое имя |
| `email`        | String    | Уникальный email (`@unique`) |
| `passwordHash` | String    | Хеш пароля (bcryptjs) |
| `createdAt`    | DateTime  | Дата создания (`@default(now())`) |
| `updatedAt`    | DateTime  | Дата обновления (`@updatedAt`) |
| `categories`   | Category[]   | Связь один-ко-многим |
| `transactions` | Transaction[] | Связь один-ко-многим |

**Каскады:** удаление `User` каскадно удаляет все его `Category` и `Transaction`.

---

### Category

Категория расходов/доходов пользователя.

| Поле        | Тип      | Описание |
|-------------|----------|----------|
| `id`        | String   | UUID |
| `name`      | String   | Название категории |
| `color`     | String   | Цвет (CSS hex, например `#4ade80`) |
| `icon`      | String   | Иконка (строка-идентификатор, например `shopping-cart`) |
| `userId`    | String   | Внешний ключ → `User.id` |
| `createdAt` | DateTime | Дата создания |
| `updatedAt` | DateTime | Дата обновления |

**Ограничения:**
- `@@unique([userId, name])` — имя категории уникально в пределах одного пользователя
- `@@index([userId])` — индекс для быстрой выборки категорий пользователя
- `onDelete: Cascade` на связи с `User`

**Каскады:** удаление `Category` **запрещено** (`Restrict`), если к ней привязаны транзакции.

---

### Transaction

Финансовая транзакция.

| Поле          | Тип             | Описание |
|---------------|-----------------|----------|
| `id`          | String          | UUID |
| `amount`      | Decimal(12, 2)  | Сумма с точностью до 2 знаков (хранится как Decimal, в API возвращается строкой) |
| `type`        | TransactionType | `income` или `expense` |
| `description` | String?         | Опциональное описание (до 500 символов на уровне DTO) |
| `date`        | DateTime        | Дата транзакции |
| `categoryId`  | String          | Внешний ключ → `Category.id` |
| `userId`      | String          | Внешний ключ → `User.id` |
| `createdAt`   | DateTime        | Дата создания |

**Ограничения:**
- `@@index([userId, date])` — индекс для фильтрации по пользователю и диапазону дат
- `@@index([categoryId])` — индекс для фильтрации по категории
- `onDelete: Cascade` на связи с `User`
- `onDelete: Restrict` на связи с `Category` — нельзя удалить категорию с транзакциями

**Примечание:** `amount` в Prisma имеет тип `Decimal`. В API-ответе сериализуется в строку (`"1500.50"`) для избежания потери точности при JSON-сериализации JavaScript `number`.

---

### Expense (legacy)

Устаревшая заготовка, не используется в бизнес-логике. Не удалять.

| Поле          | Тип      | Описание |
|---------------|----------|----------|
| `id`          | String   | CUID |
| `amount`      | Decimal(12, 2) | Сумма |
| `currency`    | String   | Валюта (`"USD"` по умолчанию) |
| `category`    | String   | Строковое название категории |
| `description` | String?  | Описание |
| `spentAt`     | DateTime | Дата трат |
| `createdAt`   | DateTime | |
| `updatedAt`   | DateTime | |

---

## Связи и каскады (сводка)

```
User ──→ Category   (onDelete: Cascade)   удалить User → удалить Category
User ──→ Transaction (onDelete: Cascade)  удалить User → удалить Transaction
Category ──→ Transaction (onDelete: Restrict)  нельзя удалить Category с транзакциями
```

---

## Переменные окружения

| Переменная     | Где задаётся    | Описание |
|----------------|-----------------|----------|
| `DATABASE_URL` | `.env` в корне  | PostgreSQL connection string (`postgresql://user:pass@localhost:5432/db`) |

---

## Команды

```bash
npm run db:up            # запустить PostgreSQL через Docker
npm run prisma:migrate   # применить миграции
npm run prisma:generate  # перегенерировать клиент после изменений схемы
npm run prisma:studio    # открыть Prisma Studio (GUI для БД)
npm run db:down          # остановить контейнер
```
