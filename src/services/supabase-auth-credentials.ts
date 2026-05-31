import { getSupabaseClient, handleSupabaseError } from '../config/supabase';

import type { User } from '../types/models';
import { capture } from '../shared/analytics/analytics-service';
import { AuthEvents } from '../shared/analytics/analytics-events';
import { mapSupabaseUser } from './supabase-user-mapper';
import { buildUserWithOnboarding } from './supabase-auth-helpers';

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
      return { user: null, error: new Error('Invalid email or password.') };
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    return { error: new Error('Password update failed. Please try again.') };
  }
}
