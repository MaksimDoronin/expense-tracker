'use client';

import { Avatar } from '@/shared/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useCurrentUser } from '@/features/auth/model/use-current-user';
import { PageHeader } from '../_components/page-header';

export default function ProfilePage() {
  const { user, isLoading } = useCurrentUser();

  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="Профиль" description="Информация о вашей учётной записи." />
      <Card className="reveal" style={{ animationDelay: '70ms' }}>
        <CardHeader>
          <CardTitle>Учётные данные</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="flex items-center gap-5">
              <Avatar name={user.name} className="size-16 rounded-[20px] text-lg" />
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold tracking-tight">{user.name}</span>
                <span className="text-muted-foreground text-sm">{user.email}</span>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-5">
              <Skeleton className="size-16 rounded-[20px]" />
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Пользователь не найден.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
