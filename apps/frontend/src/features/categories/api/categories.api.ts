import { apiRequest } from '@/shared/api/client';
import type { Category } from '@expense-tracker/shared';

export const categoriesApi = {
  list: () => apiRequest<Category[]>('/categories'),
};
