import { apiRequest } from '@/shared/api/client';
import type { AuthResult, AuthUser, LoginInput, RegisterInput } from '@/shared/types/auth';

export const authApi = {
  login: (data: LoginInput) =>
    apiRequest<AuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterInput) =>
    apiRequest<AuthResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => apiRequest<AuthUser>('/auth/me'),
};
