'use client';

import { useAuth } from '@/lib/hooks/use-auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider component
 * Initializes and manages authentication state
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize auth state
  useAuth();

  return <>{children}</>;
}
