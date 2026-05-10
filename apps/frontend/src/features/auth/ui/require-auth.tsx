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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
