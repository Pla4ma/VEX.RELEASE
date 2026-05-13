/**
 * Onboarding Progress Hooks
 *
 * Derived state hooks for onboarding progress and completion status.
 */

import { useOnboardingStore } from './onboarding-state';

/**
 * Hook to get current onboarding progress
 */
export function useOnboardingProgress() {
  const store = useOnboardingStore();
  const totalSteps = 5;
  const percentComplete = ((store.currentStep + 1) / totalSteps) * 100;

  return {
    stepNumber: store.currentStep + 1,
    totalSteps,
    percentComplete,
    canSkip: store.currentStep >= 1,
    isComplete: store.isOnboarded,
  };
}

/**
 * Hook to check if user needs onboarding
 */
export function useNeedsOnboarding(): boolean {
  const { isOnboarded } = useOnboardingStore();
  return !isOnboarded;
}
