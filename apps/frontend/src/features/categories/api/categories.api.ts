import { apiRequest } from '@/shared/api/client';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@expense-tracker/shared';

export const categoriesApi = {
  list: () => apiRequest<Category[]>('/categories'),
  create: (data: CreateCategoryInput) =>
    apiRequest<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateCategoryInput) =>
    apiRequest<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => apiRequest<void>(`/categories/${id}`, { method: 'DELETE' }),
};
