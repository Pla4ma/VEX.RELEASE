/**
 * Supabase Auth Credential Operations
 *
 * AUTH REPOSITORY EXCEPTION: This file makes direct calls to `supabase.auth.*`
 * (signUp, signInWithPassword, resetPassword, updatePassword).
 *
 * These are inherently tied to the Supabase Auth client SDK — they are not
 * table-level data access that could be abstracted behind a generic repository.
 * Creating a separate repository layer for auth SDK calls would be
 * over-engineering with no practical benefit.
 *
 * This file IS the canonical data-access layer for auth credential operations.
 * Do NOT duplicate these calls in service, hook, or component files.
 */
// Architecture note: Direct Supabase auth client access is acceptable here because this IS the auth data access layer. Moves to a feature-scoped auth/repository.ts would break the shared auth service contract.
import { getSupabaseClient, handleSupabaseError } from '../../config/supabase';

import type { User } from '../../types/models';
import { capture } from '../../shared/analytics/analytics-service';
import { AuthEvents } from '../../shared/analytics/analytics-events';
import { mapSupabaseUser } from '../../services/supabase-user-mapper';
import { buildUserWithOnboarding } from '../../services/supabase-auth-helpers';
import { TokenBucketLimiter } from '../../utils/token-bucket';

const LOGIN_RATE_LIMIT = 5;
const LOGIN_WINDOW_S = 60;
const loginLimiter = new TokenBucketLimiter({
  capacity: LOGIN_RATE_LIMIT,
  refillRate: LOGIN_RATE_LIMIT / LOGIN_WINDOW_S,
  key: 'auth:login',
});

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: {
    firstName: string;
    lastName: string;
  },
): Promise<{
  user: User | null;
  error: Error | null;
}> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata.firstName,
          last_name: metadata.lastName,
        },
      },
    });

    if (error) {
      return { user: null, error: new Error('Unable to create account. Please try again.') };
    }

    if (data.user) {
      const mapped = mapSupabaseUser(data.user, metadata);
      const user = await buildUserWithOnboarding(mapped);
      capture(AuthEvents.USER_SIGNED_UP, {
        user_id: user.id,
        method: 'email',
        is_new_user: true,
      });
      return { user, error: null };
    }

    return { user: null, error: null };
  } catch (err: unknown) {
    return { user: null, error: handleSupabaseError(err) };
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{
  user: User | null;
  error: Error | null;
}> {
  const rateCheck = await loginLimiter.consume(email.toLowerCase());
  if (!rateCheck.allowed) {
    return {
      user: null,
      error: new Error(`Too many attempts. Try again in ${rateCheck.retryAfter} seconds.`),
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: new Error('Invalid email or password.') };
    }

    if (data.user) {
      const user = await buildUserWithOnboarding(mapSupabaseUser(data.user));
      return { user, error: null };
    }

    return { user: null, error: null };
  } catch (err: unknown) {
    return { user: null, error: handleSupabaseError(err) };
  }
}

export async function resetPassword(
  email: string,
): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'vex://reset-password',
    });

    if (error) {
      // Never reveal whether an email account exists
      return { error: null };
    }

    return { error: null };
  } catch (err: unknown) {
    // Always return success for password reset to prevent email enumeration
    return { error: null };
  }
}

export async function updatePassword(
  newPassword: string,
): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return { error: new Error('Password update failed. Please try again.') };
    }

    return { error: null };
  } catch (err: unknown) {
    return { error: new Error('Password update failed. Please try again.') };
  }
}
