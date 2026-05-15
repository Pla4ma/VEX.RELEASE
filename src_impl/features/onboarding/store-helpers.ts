import { useAuthStore } from '../../store';

import type { FocusDuration, FocusGoal, OnboardingState } from './schemas';

export type OnboardingDraft = {
  goal?: FocusGoal;
  focusDuration?: FocusDuration;
  displayName?: string;
  starterPresetId?: string;
  element?: string;
  personaId?: string;
  squadId?: string | null;
};

function getCurrentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

export function mergeOnboardingCompletion(
  isOnboarded: boolean,
  completedAt: number | null,
): Pick<OnboardingState, 'isOnboarded' | 'completedAt' | 'completedForUserId'> {
  const currentUserId = getCurrentUserId();
  return {
    isOnboarded,
    completedAt,
    completedForUserId: isOnboarded ? currentUserId : null,
  };
}

export function isCompletionValidForUser(
  state: Pick<OnboardingState, 'isOnboarded' | 'completedAt' | 'completedForUserId'>,
  userId: string | null | undefined,
): boolean {
  if (!userId) {
    return false;
  }

  if (!state.isOnboarded || !state.completedAt) {
    return false;
  }

  return state.completedForUserId === userId;
}
