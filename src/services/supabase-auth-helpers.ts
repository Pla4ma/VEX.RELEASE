import type { User } from '../types/models';
import { fetchOnboardingStatus } from '../features/auth/repository-onboarding';
import { attachOnboardingCompletion } from './supabase-user-mapper';
import { captureSilentFailure } from '../utils/silent-failure';

export async function fetchUserOnboardingStatus(
  userId: string,
): Promise<string | null> {
  try {
    return await fetchOnboardingStatus(userId);
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'auth',
      operation: 'fetchUserOnboardingStatus',
      type: 'data',
    });
    return null;
  }
}

export async function buildUserWithOnboarding(user: User): Promise<User> {
  const onboardingCompletedAt = await fetchUserOnboardingStatus(user.id);
  return attachOnboardingCompletion(user, onboardingCompletedAt);
}
