'use client';

import { useAuth } from './auth.context';

export function useCurrentUser() {
  const { user, isLoadingUser } = useAuth();
  return { user, isLoading: isLoadingUser };
}
