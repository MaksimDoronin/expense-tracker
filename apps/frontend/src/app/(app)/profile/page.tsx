'use client';

import { Avatar } from '@/shared/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useCurrentUser } from '@/features/auth/model/use-current-user';

export default function ProfilePage() {
  const { user, isLoading } = useCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Профиль</h1>
        <p className="text-sm text-muted-foreground">Информация о вашей учётной записи.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Учётные данные</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="flex items-center gap-4">
              <Avatar name={user.name} className="h-16 w-16 text-lg" />
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">{user.name}</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Пользователь не найден.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
