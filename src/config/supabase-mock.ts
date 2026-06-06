import { AuthError, type SupabaseClient } from '@supabase/supabase-js';

export function createMockSupabaseClient(): SupabaseClient {
  const err = new Error(
    'Supabase not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment.',
  );
  const authErr = new AuthError(err.message, 500, 'mock_error');
  const mockClient = {
    auth: {
      signUp: async () => ({ data: { user: null, session: null }, error: authErr }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: authErr }),
      signInWithOAuth: async () => ({ data: { provider: null, url: null }, error: authErr }),
      signInWithIdToken: async () => ({ data: { user: null, session: null }, error: authErr }),
      exchangeCodeForSession: async () => ({
        data: { session: null, user: null },
        error: authErr,
      }),
      signOut: async () => ({ error: authErr }),
      getSession: async () => ({ data: { session: null }, error: authErr }),
      getUser: async () => ({ data: { user: null }, error: authErr }),
      resetPasswordForEmail: async () => ({ data: null, error: authErr }),
      updateUser: async () => ({ data: { user: null }, error: authErr }),
      onAuthStateChange: () => ({
        data: { subscription: { id: 'mock-sub', callback: () => {}, unsubscribe: () => {} } },
      }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: () => ({ data: [] as never[], error: null }) }) }),
    }),
  };
  // safe-cast: Partial mock — SupabaseClient has hundreds of methods.
  // Proper fix: use msw or a full mock library. Cast is safe for test paths.
  return mockClient as unknown as SupabaseClient;
}
