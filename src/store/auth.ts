import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isLoading: false,
        isAuthenticated: false,

        // Actions
        setUser: (user) =>
          set(
            {
              user,
              isAuthenticated: !!user,
            },
            false,
            'auth/setUser'
          ),

        setLoading: (isLoading) =>
          set({ isLoading }, false, 'auth/setLoading'),

        login: async (email, password) => {
          set({ isLoading: true }, false, 'auth/login/start');

          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) throw error;

            if (data.user) {
              // Fetch user profile
              const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

              if (profileError && profileError.code !== 'PGRST116') {
                // PGRST116 is "not found" error, which is expected for new users
                throw profileError;
              }

              const user: User = {
                id: data.user.id,
                email: data.user.email!,
                firstName: profile?.first_name || '',
                lastName: profile?.last_name || '',
                phone: profile?.phone,
                avatarUrl: profile?.avatar_url,
                role: profile?.role || 'customer',
                status: profile?.status || 'active',
                createdAt: data.user.created_at,
                updatedAt: profile?.updated_at || data.user.created_at,
              };

              set(
                {
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                },
                false,
                'auth/login/success'
              );
            }
          } catch (error) {
            set({ isLoading: false }, false, 'auth/login/error');
            throw error;
          }
        },

        register: async (data) => {
          set({ isLoading: true }, false, 'auth/register/start');

          try {
            const { data: authData, error } = await supabase.auth.signUp({
              email: data.email,
              password: data.password,
            });

            if (error) throw error;

            if (authData.user) {
              // Create user profile
              const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                  id: authData.user.id,
                  first_name: data.firstName,
                  last_name: data.lastName,
                  phone: data.phone,
                  role: 'customer',
                  status: 'active',
                });

              if (profileError) {
                console.error('Profile creation error:', profileError);
                // Don't throw error here as the user is already created
                // We can create the profile later
              }

              const user: User = {
                id: authData.user.id,
                email: authData.user.email!,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: 'customer',
                status: 'active',
                createdAt: authData.user.created_at,
                updatedAt: authData.user.created_at,
              };

              set(
                {
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                },
                false,
                'auth/register/success'
              );
            }
          } catch (error) {
            set({ isLoading: false }, false, 'auth/register/error');
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true }, false, 'auth/logout/start');

          try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            set(
              {
                user: null,
                isAuthenticated: false,
                isLoading: false,
              },
              false,
              'auth/logout/success'
            );
          } catch (error) {
            set({ isLoading: false }, false, 'auth/logout/error');
            throw error;
          }
        },

        refreshUser: async () => {
          const { data } = await supabase.auth.getUser();

          if (data.user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              firstName: profile?.first_name,
              lastName: profile?.last_name,
              phone: profile?.phone,
              avatarUrl: profile?.avatar_url,
              role: profile?.role || 'customer',
              status: profile?.status || 'active',
              createdAt: data.user.created_at,
              updatedAt: profile?.updated_at || data.user.created_at,
            };

            set(
              {
                user,
                isAuthenticated: true,
              },
              false,
              'auth/refreshUser'
            );
          } else {
            set(
              {
                user: null,
                isAuthenticated: false,
              },
              false,
              'auth/refreshUser/noUser'
            );
          }
        },

        updateProfile: async (data) => {
          const { user } = get();
          if (!user) throw new Error('User not authenticated');

          set({ isLoading: true }, false, 'auth/updateProfile/start');

          try {
            const { error } = await supabase
              .from('user_profiles')
              .update({
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone,
                avatar_url: data.avatarUrl,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);

            if (error) throw error;

            const updatedUser = {
              ...user,
              ...data,
              updatedAt: new Date().toISOString(),
            };

            set(
              {
                user: updatedUser,
                isLoading: false,
              },
              false,
              'auth/updateProfile/success'
            );
          } catch (error) {
            set({ isLoading: false }, false, 'auth/updateProfile/error');
            throw error;
          }
        },

        forgotPassword: async (email) => {
          set({ isLoading: true }, false, 'auth/forgotPassword/start');

          try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            set({ isLoading: false }, false, 'auth/forgotPassword/success');
          } catch (error) {
            console.error('Forgot password error:', error);
            set({ isLoading: false }, false, 'auth/forgotPassword/error');
            throw error;
          }
        },

        resetPassword: async (password) => {
          set({ isLoading: true }, false, 'auth/resetPassword/start');

          try {
            const { error } = await supabase.auth.updateUser({
              password: password,
            });

            if (error) throw error;

            set({ isLoading: false }, false, 'auth/resetPassword/success');
          } catch (error) {
            console.error('Reset password error:', error);
            set({ isLoading: false }, false, 'auth/resetPassword/error');
            throw error;
          }
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);
