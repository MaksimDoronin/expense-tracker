import { apiRequest } from '@/shared/api/client';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@expense-tracker/shared';

export const categoriesApi = {
  /**
   * Получает список всех категорий текущего пользователя.
   *
   * @returns Промис с массивом `Category[]`, отсортированным по дате создания.
   * @throws {ApiError} При ответе сервера не 2xx.
   */
  list: () => apiRequest<Category[]>('/categories'),

  /**
   * Создаёт новую категорию.
   *
   * @param data - Название, иконка и цвет новой категории.
   * @returns Промис с созданной `Category`.
   * @throws {ApiError} При ответе 409 (имя занято) или других ошибках сервера.
   */
  create: (data: CreateCategoryInput) =>
    apiRequest<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),

  /**
   * Частично обновляет категорию по идентификатору.
   *
   * @param id - UUID обновляемой категории.
   * @param data - Поля для обновления; непереданные поля остаются без изменений.
   * @returns Промис с обновлённой `Category`.
   * @throws {ApiError} При ответе 404 (не найдена) или 409 (имя занято).
   */
  update: (id: string, data: UpdateCategoryInput) =>
    apiRequest<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  /**
   * Удаляет категорию по идентификатору.
   *
   * @param id - UUID удаляемой категории.
   * @returns Промис, разрешающийся в `void` при успехе (HTTP 204).
   * @throws {ApiError} При ответе 404 (не найдена) или 409 (есть транзакции).
   */
  remove: (id: string) => apiRequest<void>(`/categories/${id}`, { method: 'DELETE' }),
};
