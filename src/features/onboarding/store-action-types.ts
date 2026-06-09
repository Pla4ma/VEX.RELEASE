import type { OnboardingStore } from './store';
import type { OnboardingState } from './schemas';
import { useAuthStore } from '../../store';

export const initialState: OnboardingState = {
  isOnboarded: false,
  currentStep: 0,
  goal: null,
  focusDuration: null,
  displayName: null,
  startedAt: null,
  completedAt: null,
  completedForUserId: null,
  persona: null,
  element: null,
  motivationProfile: null,
  explicitMotivationStyle: null,
  profileStepsCompleted: false,
  firstSessionStarted: false,
  firstSessionCompleted: false,
  homePreviewEntered: false,
  chosenLane: null,
  mascotGuideCompletedAt: null,
  mascotGuideDismissedAt: null,
};

export function getCurrentUserIdForBool(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

/** Mark profile steps as complete when advancing to or past step 5 (FIRST_SESSION_CTA). */
export function advanceStepWithCompletionCheck(
  set: (partial: Partial<OnboardingStore>) => void,
  get: () => OnboardingStore,
  targetStep: number,
): void {
  const updates: Partial<OnboardingState> = { currentStep: targetStep };
  if (targetStep >= 5) {
    updates.profileStepsCompleted = true;
  }
  set(updates);
}
