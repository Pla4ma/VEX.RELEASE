/**
 * Supabase Auth Service
 *
 * Authentication using Supabase Auth.
 */

import { getSupabaseClient, handleSupabaseError } from '../config/supabase';
import type { User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import type { User } from '../types/models';
import { capture } from '../shared/analytics/analytics-service';
import { AuthEvents } from '../shared/analytics/analytics-events';

/**
 * Sign up with email/password
 */
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

/**
 * Sign in with email/password
 */
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

/**
 * Sign out
 */
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

/**
 * Get current session
 */
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

/**
 * Get current user
 */
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

/**
 * Reset password
 */
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

/**
 * Update password
 */
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

/**
 * Subscribe to auth changes
 */
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

/**
 * Map Supabase user to VEX User type
 */
function mapSupabaseUser(
  sbUser: SupabaseUser,
  overrideMetadata?: { firstName: string; lastName: string }
): User {
  const now = new Date().toISOString();
  const metadata = sbUser.user_metadata || {};

  const firstName = overrideMetadata?.firstName || metadata.first_name || '';
  const lastName = overrideMetadata?.lastName || metadata.last_name || '';
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : sbUser.email?.split('@')[0] || '';

  return {
    id: sbUser.id,
    email: sbUser.email || '',
    username: metadata.username || sbUser.email?.split('@')[0] || '',
    firstName,
    lastName,
    displayName,
    squadId: metadata.squad_id || metadata.squadId || null,
    avatar: metadata.avatar_url || undefined,
    bio: metadata.bio || undefined,
    verified: Boolean(metadata.verified),
    role: metadata.role || 'user',
    status: 'active',
    preferences: {
      theme: metadata.theme || 'system',
      language: metadata.language || 'en',
      notifications: {
        push: true,
        email: true,
        sms: false,
        inApp: true,
        digestFrequency: 'daily',
        quietHours: { enabled: false, start: '22:00', end: '08:00', timezone: 'UTC' },
      },
      privacy: {
        profileVisibility: 'public',
        activityStatus: true,
        readReceipts: true,
        allowTagging: true,
        allowMentions: true,
        dataSharing: false,
      },
      accessibility: {
        reduceMotion: false,
        highContrast: false,
        largeText: false,
        screenReaderOptimized: false,
      },
    },
    metadata: {
      lastLoginAt: sbUser.last_sign_in_at || now,
      loginCount: metadata.login_count || 1,
      deviceHistory: [],
    },
    createdAt: sbUser.created_at || now,
    updatedAt: sbUser.updated_at || now,
  };
}
