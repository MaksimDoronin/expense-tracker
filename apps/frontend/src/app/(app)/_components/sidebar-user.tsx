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
      <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          {isLoading && <Skeleton className="h-3 w-32" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
      <Avatar name={user.name} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{user.name}</div>
        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        title="Выйти"
        aria-label="Выйти"
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
