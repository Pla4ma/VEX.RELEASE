import { getSupabaseClient, handleSupabaseError } from '../../config/supabase';
import { mapSupabaseUser, attachOnboardingCompletion } from '../../services/supabase-user-mapper';
import type { User } from './types';
import type { SignUpMetadata, AuthResult } from './types';

const supabase = getSupabaseClient();

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: SignUpMetadata,
): Promise<AuthResult> {
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
    const mapped = mapSupabaseUser(data.user, metadata);
    const user = await attachOnboardingCompletion(mapped, null);
    return { user, error: null };
  }

  return { user: null, error: new Error('No user returned from sign up') };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { user: null, error: new Error(error.message) };
  }

  const user = data.user ? mapSupabaseUser(data.user) : null;
  const finalUser = user ? await attachOnboardingCompletion(user, null) : null;
  return { user: finalUser, error: null };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw handleSupabaseError(error);
  }
}

export async function getSessionUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) {
    return null;
  }
  const mapped = mapSupabaseUser(data.session.user);
  return attachOnboardingCompletion(mapped, null);
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    throw handleSupabaseError(error);
  }
}

export async function updateUserPassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw handleSupabaseError(error);
  }
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) {
    throw handleSupabaseError(error);
  }
}
