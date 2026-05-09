'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { useAuth } from './auth.context';

const schema = z.object({
  email: z.string().email('Некорректный адрес электронной почты'),
  password: z.string().min(1, 'Введите пароль'),
});

type FormValues = z.infer<typeof schema>;

export function useLogin() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = form.handleSubmit(async (data) => {
    setServerError(null);
    try {
      const result = await authApi.login(data);
      setAuth(result);
      router.push('/');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ошибка входа');
    }
  });

  return { form, onSubmit, serverError, isLoading: form.formState.isSubmitting };
}
