import { getSupabaseClient } from '../config/supabase';

import type { User } from '../types/models';
import { attachOnboardingCompletion } from './supabase-user-mapper';

export async function fetchUserOnboardingStatus(
  userId: string,
): Promise<string | null> {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .select('onboarding_completed_at')
    .eq('id', userId)
    .maybeSingle<{ onboarding_completed_at: string | null }>();
  if (error) {return null;}
  return data?.onboarding_completed_at ?? null;
}

export async function buildUserWithOnboarding(user: User): Promise<User> {
  const onboardingCompletedAt = await fetchUserOnboardingStatus(user.id);
  return attachOnboardingCompletion(user, onboardingCompletedAt);
}
