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
import { useRegister } from '../model/use-register';

export function RegisterForm() {
  const { form, onSubmit, serverError, isLoading } = useRegister();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Создать аккаунт</CardTitle>
        <CardDescription>Введите данные для регистрации</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="flex flex-col gap-4">
          {serverError && (
            <p className="whitespace-pre-line text-sm text-destructive">{serverError}</p>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              type="text"
              placeholder="Иван Иванов"
              autoComplete="name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
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
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-foreground"
                {...register('terms')}
              />
              <Label htmlFor="terms" className="cursor-pointer font-normal leading-snug">
                Согласен с{' '}
                <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                  пользовательским соглашением
                </Link>{' '}
                и{' '}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                  политикой обработки данных
                </Link>
              </Label>
            </div>
            {errors.terms && (
              <p className="text-xs text-destructive">{errors.terms.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Создание аккаунта…' : 'Создать аккаунт'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link
              href="/login"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              Войти
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
