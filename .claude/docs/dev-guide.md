# Dev Guide

## Добавить бэкенд-модуль

Пример: новый модуль `reports`.

### 1. Создать структуру файлов

```
src/reports/
  domain/
    report.entity.ts    # интерфейс PublicReport
    errors.ts           # ReportNotFoundError extends Error { ... }
  dto/
    create-report.dto.ts
  reports.controller.ts
  reports.service.ts
  reports.module.ts
```

### 2. Описать доменный тип

```ts
// domain/report.entity.ts
export interface PublicReport {
  id: string;
  userId: string;
  // ...
}
```

### 3. Создать DTO с валидацией

```ts
// dto/create-report.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ description: 'Название отчёта', example: 'Итог мая' })
  @IsString()
  @MaxLength(100)
  title!: string;
}
```

### 4. Написать сервис

```ts
// reports.service.ts
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReportDto): Promise<PublicReport> {
    // прямая работа с Prisma (если нет CQRS)
  }
}
```

Если модуль сложный — используй CQRS (см. раздел ниже).

### 5. Написать контроллер

```ts
// reports.controller.ts
@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать отчёт' })
  @ApiResponse({ status: 201, description: 'Отчёт создан.' })
  async create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateReportDto) {
    try {
      return await this.reportsService.create(user.sub, dto);
    } catch (err) {
      if (err instanceof ReportNotFoundError) throw new NotFoundException(err.message);
      throw err;
    }
  }
}
```

### 6. Зарегистрировать модуль

```ts
// reports.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
```

```ts
// app.module.ts — добавить в imports:
ReportsModule
```

---

## Добавить CQRS (команды/запросы)

Используй, когда сервис сложный и нужно разделить чтение и запись.

### 1. Создать команду

```ts
// commands/create-report.command.ts
export class CreateReportCommand {
  constructor(
    public readonly userId: string,
    public readonly title: string,
  ) {}
}
```

### 2. Написать обработчик

```ts
// commands/handlers/create-report.handler.ts
@CommandHandler(CreateReportCommand)
export class CreateReportHandler implements ICommandHandler<CreateReportCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateReportCommand): Promise<PublicReport> {
    return this.prisma.report.create({ data: { ... } });
  }
}
```

### 3. Обновить сервис

```ts
// reports.service.ts
@Injectable()
export class ReportsService {
  constructor(private readonly commandBus: CommandBus) {}

  create(userId: string, dto: CreateReportDto) {
    return this.commandBus.execute(new CreateReportCommand(userId, dto.title));
  }
}
```

### 4. Зарегистрировать в модуле

```ts
@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService, CreateReportHandler],
})
export class ReportsModule {}
```

---

## Добавить общий тип (shared)

Тип, используемый и фронтендом, и бэкендом, должен быть в `packages/shared/src/index.ts`.

```ts
// packages/shared/src/index.ts
export interface Report {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
}
```

После этого в обоих приложениях:

```ts
import { Report } from '@expense-tracker/shared';
```

---

## Добавить миграцию

### 1. Изменить схему

```prisma
// prisma/schema.prisma
model Report {
  id        String   @id @default(uuid())
  title     String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@index([userId])
}
```

Если модель связана с `User` — добавь обратную связь в модель `User`:

```prisma
model User {
  // ...
  reports Report[]
}
```

### 2. Применить миграцию

```bash
npm run db:up              # БД должна быть запущена
npm run prisma:migrate     # создаёт файл миграции и применяет её
npm run prisma:generate    # перегенерировать клиент
```

Файл миграции появится в `prisma/migrations/`.

---

## Добавить фичу на фронтенде (FSD)

Пример: фича `reports`.

### 1. Создать API-слой

```ts
// features/reports/api/reports.api.ts
import { apiRequest } from '@/shared/api/client';
import type { Report } from '@expense-tracker/shared';

export const reportsApi = {
  list: () => apiRequest<Report[]>('/reports'),
  create: (data: { title: string }) =>
    apiRequest<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
```

### 2. Создать хук

```ts
// features/reports/model/use-reports.ts
import { useState, useEffect } from 'react';
import { reportsApi } from '../api/reports.api';
import type { Report } from '@expense-tracker/shared';

export function useReports() {
  const [items, setItems] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    reportsApi.list().then(setItems).finally(() => setIsLoading(false));
  }, []);

  return { items, isLoading };
}
```

### 3. Создать UI-компонент

```tsx
// features/reports/ui/report-list.tsx
'use client';
import { useReports } from '../model/use-reports';

export function ReportList() {
  const { items, isLoading } = useReports();
  if (isLoading) return <div>Загрузка...</div>;
  return <ul>{items.map(r => <li key={r.id}>{r.title}</li>)}</ul>;
}
```

### 4. Добавить страницу

```tsx
// app/(app)/reports/page.tsx
import { ReportList } from '@/features/reports/ui/report-list';

export default function ReportsPage() {
  return (
    <main>
      <h1>Отчёты</h1>
      <ReportList />
    </main>
  );
}
```

Страница автоматически защищена через `app/(app)/layout.tsx` (`RequireAuth`).

---

## Добавить shadcn/ui компонент

```bash
# из корня или apps/frontend
npx shadcn@latest add <component-name>
```

Компонент появится в `apps/frontend/src/shared/ui/`. Дополнительная конфигурация не нужна.

---

## Правила именования

| Что                  | Формат                         | Пример |
|----------------------|--------------------------------|--------|
| Ветка                | `<type>/<short-description>`   | `feat/reports-page` |
| Коммит               | `<type>(<scope>): <описание>`  | `feat(reports): добавить список отчётов` |
| Файлы бэкенда        | kebab-case                     | `reports.service.ts` |
| Файлы фронтенда      | kebab-case                     | `use-reports.ts`, `report-list.tsx` |
| Классы/интерфейсы    | PascalCase                     | `ReportsService`, `PublicReport` |
| Хуки                 | `use-` prefix                  | `use-reports.ts` |

---

## Чеклист перед созданием PR

- [ ] TypeScript компилируется без ошибок: `npm run type-check --workspace=backend`
- [ ] Линтер проходит: `npm run lint`
- [ ] Форматирование: `npm run format`
- [ ] Новые методы контроллера/сервиса покрыты JSDoc
- [ ] DTO контроллера имеют `@ApiProperty` / `@ApiPropertyOptional`
- [ ] Общие типы добавлены в `packages/shared/src/index.ts`
- [ ] Миграции применены и клиент перегенерирован
