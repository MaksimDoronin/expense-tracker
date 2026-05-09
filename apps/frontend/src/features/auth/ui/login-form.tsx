'use client';

import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { useLogin } from '../model/use-login';

export function LoginForm() {
  const { form, onSubmit, serverError, isLoading } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>Введите данные для входа в аккаунт</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="flex flex-col gap-4">
          {serverError && (
            <p className="whitespace-pre-line text-sm text-destructive">{serverError}</p>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Электронная почта</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Выполняется вход…' : 'Войти'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link
              href="/register"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              Зарегистрироваться
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
