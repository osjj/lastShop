import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

/**
 * Create Supabase client for client-side operations
 * This client is used in React components and client-side code
 */
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

/**
 * Get Supabase client instance
 * Use this in React components and client-side hooks
 */
export const supabase = createClient();
