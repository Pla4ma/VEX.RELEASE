import {
  getSupabaseClient,
  handleSupabaseError,
} from '../../config/supabase';
import {
  attachOnboardingCompletion,
  mapSupabaseUser,
} from '../../services/supabase-user-mapper';
import type { AuthResult } from './types';

export async function signInAnonymously(): Promise<AuthResult> {
  try {
    const client = getSupabaseClient();
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) {
      return { user: null, error: handleSupabaseError(sessionError) };
    }

    let authUser = sessionData.session?.user;
    if (!authUser) {
      const { data, error } = await client.auth.signInAnonymously();
      if (error) {
        return { user: null, error: handleSupabaseError(error) };
      }
      if (!data.user || !data.session) {
        return {
          user: null,
          error: new Error('Guest sign-in returned no authenticated session.'),
        };
      }
      authUser = data.user;
    }

    const mappedUser = mapSupabaseUser(authUser);
    const user = {
      ...mappedUser,
      username: mappedUser.username || `guest-${authUser.id.slice(0, 8)}`,
      firstName: mappedUser.firstName || 'Guest',
      displayName: mappedUser.displayName || 'Guest',
      metadata: {
        ...mappedUser.metadata,
        ...(authUser.is_anonymous ? { signupSource: 'anonymous' } : {}),
      },
    };
    return {
      user: await attachOnboardingCompletion(user, null),
      error: null,
    };
  } catch (error) {
    return { user: null, error: handleSupabaseError(error) };
  }
}
