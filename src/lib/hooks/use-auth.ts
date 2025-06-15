'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase/client';

/**
 * Custom hook to manage authentication state
 * Automatically syncs with Supabase auth state changes
 */
export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, refreshUser } = useAuthStore();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          try {
            await refreshUser();
          } catch (error) {
            console.error('Error refreshing user on initial session:', error);
            // If refresh fails, still set basic user info
            setUser({
              id: session.user.id,
              email: session.user.email!,
              firstName: '',
              lastName: '',
              role: 'customer',
              status: 'active',
              createdAt: session.user.created_at,
              updatedAt: session.user.created_at,
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        if (session?.user) {
          try {
            await refreshUser();
          } catch (error) {
            console.error('Error refreshing user on auth state change:', error);
            // If refresh fails, still set basic user info
            setUser({
              id: session.user.id,
              email: session.user.email!,
              firstName: '',
              lastName: '',
              role: 'customer',
              status: 'active',
              createdAt: session.user.created_at,
              updatedAt: session.user.created_at,
            });
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, refreshUser]);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
