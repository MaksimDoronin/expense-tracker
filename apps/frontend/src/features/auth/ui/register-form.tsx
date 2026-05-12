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
    <Card className="w-full">
      <CardHeader className="pb-5">
        <CardTitle className="text-2xl">Создать аккаунт</CardTitle>
        <CardDescription>Введите данные для регистрации</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="flex flex-col gap-4">
          {serverError && (
            <p className="bg-danger-soft text-danger-soft-foreground rounded-xl px-3.5 py-2.5 text-[13px] font-medium whitespace-pre-line">
              {serverError}
            </p>
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
              <p className="text-danger text-[12px] font-medium">{errors.name.message}</p>
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
              <p className="text-danger text-[12px] font-medium">{errors.email.message}</p>
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
              <p className="text-danger text-[12px] font-medium">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                className="accent-success mt-0.5 size-4 shrink-0 cursor-pointer rounded"
                {...register('terms')}
              />
              <Label
                htmlFor="terms"
                className="text-muted-foreground cursor-pointer text-[13px] leading-snug font-normal"
              >
                Согласен с{' '}
                <Link href="/terms" className="text-success font-semibold hover:underline">
                  пользовательским соглашением
                </Link>{' '}
                и{' '}
                <Link href="/privacy" className="text-success font-semibold hover:underline">
                  политикой обработки данных
                </Link>
              </Label>
            </div>
            {errors.terms && (
              <p className="text-danger text-[12px] font-medium">{errors.terms.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Создание аккаунта…' : 'Создать аккаунт'}
          </Button>
          <p className="text-muted-foreground text-sm">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-success font-semibold hover:underline">
              Войти
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
