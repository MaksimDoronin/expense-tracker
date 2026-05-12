'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { useAuth } from './auth.context';

const schema = z.object({
  name: z.string().min(1, 'Имя обязательно').max(120, 'Имя слишком длинное'),
  email: z.string().email('Некорректный адрес электронной почты'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(128, 'Пароль слишком длинный'),
  terms: z.literal(true, { message: 'Необходимо принять условия' }),
});

type FormValues = z.infer<typeof schema>;

export function useRegister() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = form.handleSubmit(async ({ terms: _terms, ...registerData }) => {
    setServerError(null);
    try {
      const result = await authApi.register(registerData);
      setAuth(result);
      router.push('/');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ошибка регистрации');
    }
  });

  return { form, onSubmit, serverError, isLoading: form.formState.isSubmitting };
}
