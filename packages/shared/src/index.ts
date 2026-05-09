export type Currency = 'USD' | 'EUR' | 'RUB';

export interface Expense {
  id: string;
  amount: string;
  currency: Currency | string;
  category: string;
  description?: string | null;
  spentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  amount: string;
  currency?: Currency | string;
  category: string;
  description?: string;
  spentAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
  icon: string;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
  icon?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
