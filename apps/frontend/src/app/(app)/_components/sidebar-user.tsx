'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Avatar } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import { useAuth } from '@/features/auth/model/auth.context';
import { useCurrentUser } from '@/features/auth/model/use-current-user';

export function SidebarUser() {
  const { user, isLoading } = useCurrentUser();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!user) {
    return (
      <div className="bg-card flex items-center gap-3 rounded-2xl p-3 shadow-[var(--shadow-pill)]">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-24" />
          {isLoading && <Skeleton className="h-3 w-32" />}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card flex items-center gap-3 rounded-2xl p-2.5 pr-1.5 shadow-[var(--shadow-pill)]">
      <Avatar name={user.name} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] leading-tight font-bold">{user.name}</div>
        <div className="text-muted-foreground truncate text-[12px]">{user.email}</div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        title="Выйти"
        aria-label="Выйти"
        className="text-muted-foreground hover:bg-danger-soft hover:text-danger-soft-foreground shrink-0 rounded-xl p-2 transition-colors"
      >
        <LogOut className="size-[17px]" />
      </button>
    </div>
  );
}
