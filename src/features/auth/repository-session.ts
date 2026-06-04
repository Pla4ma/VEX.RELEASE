/**
 * Supabase Auth Session Operations
 *
 * AUTH REPOSITORY EXCEPTION: This file makes direct calls to `supabase.auth.*`
 * (signOut, getSession, getUser, onAuthStateChange).
 *
 * These are inherently tied to the Supabase Auth client SDK — they are not
 * table-level data access that could be abstracted behind a generic repository.
 * Creating a separate repository layer for auth SDK calls would be
 * over-engineering with no practical benefit.
 *
 * This file IS the canonical data-access layer for auth session operations.
 * Do NOT duplicate these calls in service, hook, or component files.
 */
// Architecture note: Direct Supabase auth client access is acceptable here because this IS the auth data access layer. Moves to a feature-scoped auth/repository.ts would break the shared auth service contract.
import { getSupabaseClient, handleSupabaseError } from '../../config/supabase';

import type { User } from '../../types/models';
import { capture } from '../../shared/analytics/analytics-service';
import { AuthEvents } from '../../shared/analytics/analytics-events';
import { mapSupabaseUser } from '../../services/supabase-user-mapper';
import { buildUserWithOnboarding } from '../../services/supabase-auth-helpers';
import { captureSilentFailure } from '../../utils/silent-failure';

export async function signOut(
  userId?: string,
): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient();

    if (userId) {
      capture(AuthEvents.USER_LOGGED_OUT, { user_id: userId });
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return { error: handleSupabaseError(err) };
  }
}

export async function getCurrentSession() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { session: null, error: new Error(error.message) };
    }

    return { session: data.session, error: null };
  } catch (err) {
    return { session: null, error: handleSupabaseError(err) };
  }
}

export async function getCurrentUser(): Promise<{
  user: User | null;
  error: Error | null;
}> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { user: null, error: new Error(error.message) };
    }

    if (data.user) {
      const user = await buildUserWithOnboarding(mapSupabaseUser(data.user));
      return { user, error: null };
    }

    return { user: null, error: null };
  } catch (err) {
    return { user: null, error: handleSupabaseError(err) };
  }
}

export function onAuthStateChange(callback: (user: User | null) => void): {
  unsubscribe: () => void;
} {
  const supabase = getSupabaseClient();
  const { data } = supabase.auth.onAuthStateChange((_, session) => {
    if (session?.user) {
      const mapped = mapSupabaseUser(session.user);
      buildUserWithOnboarding(mapped)
        .then((resolvedUser) => callback(resolvedUser))
        .catch((error: unknown) => {
          captureSilentFailure(error, { feature: 'auth', operation: 'buildUserWithOnboarding', type: 'data' });
          callback(mapped);
        });
    } else {
      callback(null);
    }
  });

  return { unsubscribe: data.subscription.unsubscribe };
}
