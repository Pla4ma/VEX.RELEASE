import { getSupabaseClient, handleSupabaseError } from "../config/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "../types/models";
import { capture } from "../shared/analytics/analytics-service";
import { AuthEvents } from "../shared/analytics/analytics-events";


export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: { firstName: string; lastName: string }
): Promise<{ user: User | null; error: Error | null }> {
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
      return { user: null, error: new Error(error.message) };
    }

    if (data.user) {
      const user = mapSupabaseUser(data.user, metadata);
      // Track sign up analytics
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
  password: string
): Promise<{ user: User | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: new Error(error.message) };
    }

    if (data.user) {
      const user = mapSupabaseUser(data.user);
      return { user, error: null };
    }

    return { user: null, error: null };
  } catch (err) {
    return { user: null, error: handleSupabaseError(err) };
  }
}

export async function signOut(userId?: string): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient();
    // Track logout analytics before signing out
    if (userId) {
      capture(AuthEvents.USER_LOGGED_OUT, {
        user_id: userId,
      });
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

export async function getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { user: null, error: new Error(error.message) };
    }

    if (data.user) {
      const user = mapSupabaseUser(data.user);
      return { user, error: null };
    }

    return { user: null, error: null };
  } catch (err) {
    return { user: null, error: handleSupabaseError(err) };
  }
}

export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'vex://reset-password',
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return { error: handleSupabaseError(err) };
  }
}

export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return { error: handleSupabaseError(err) };
  }
}

export function onAuthStateChange(
  callback: (user: User | null) => void
): { unsubscribe: () => void } {
  const supabase = getSupabaseClient();

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback(mapSupabaseUser(session.user));
    } else {
      callback(null);
    }
  });

  return { unsubscribe: data.subscription.unsubscribe };
}