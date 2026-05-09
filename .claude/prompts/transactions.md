# Новая функциональность - Создать модуль транзакций. 

## Контекст (что уже есть)
- NestJS + Next.js + PostgreSQL + Prisma
- Авторизация (JWT), модуль категорий

## Задача
Центральный модуль учёта доходов и расходов.

## Модель данных
Транзакция: id, amount, type (income/expense), description, date, categoryId, userId, createdAt

Обнови модели User и Category - добавь обратные связи transactions Transaction[].

После изменения схемы создай и примени миграцию

## Контроллер и эндпоинты
- POST /transactions: создать транзакцию 
- GET /transactions: список с query параметрами dateFrom, dateTo, type, categoryId (по пользователю)
- GET /transactions/summary: агрегация, query параметры month и year (оба обязательные)
- GET /transactions/:id: одна транзакция 
- PATCH /transactions/:id: обновить
- DELETE /transactions/:id: удалить

## Паттерн
- Следуй структуре модуля из @apps/backend/src/categories/
- Взаимодействие через CQRS

## Ограничения
- Не добавлять зависимости без указания
- class-validator для DTO
- После реализации запустить сборку