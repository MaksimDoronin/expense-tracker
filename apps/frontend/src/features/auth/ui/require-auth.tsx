'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/model/auth.context';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoadingUser, router]);

  if (isLoadingUser) {
    return (
      <div className="bg-shell flex min-h-screen items-center justify-center">
        <div className="border-foreground/15 border-t-foreground size-8 animate-spin rounded-full border-[3px]" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
