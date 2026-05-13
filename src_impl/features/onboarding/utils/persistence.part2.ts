import { captureSilentFailure } from "../../../utils/silent-failure";
import { MMKV } from "react-native-mmkv";
import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";
import type { OnboardingState, OnboardingStep, FocusGoal, FocusDuration } from "../schemas";


export function recordCompletionAttempt(success: boolean, error?: string): void {
  const attempts = storage.getNumber(KEYS.COMPLETION_ATTEMPTS) || 0;
  storage.set(KEYS.COMPLETION_ATTEMPTS, attempts + 1);

  eventBus.publish('analytics:track', {
    event: 'onboarding_completion_attempt',
    properties: {
      success,
      attemptNumber: attempts + 1,
      error: error || null,
    },
  });
}

export function getCompletionAttempts(): number {
  return storage.getNumber(KEYS.COMPLETION_ATTEMPTS) || 0;
}

export function getPartialData(): Partial<OnboardingState> | null {
  const state = loadPersistedOnboarding();

  if (!state || state.isOnboarded) {
    return null;
  }

  // Only return data from completed steps
  const partial: Partial<OnboardingState> = {};

  if (state.currentStep > 1) {
    partial.goal = state.goal;
  }
  if (state.currentStep > 2) {
    partial.focusDuration = state.focusDuration;
  }
  if (state.currentStep > 3) {
    partial.displayName = state.displayName;
  }

  return Object.keys(partial).length > 0 ? partial : null;
}

export const OnboardingPersistence = {
  persist: persistOnboardingState,
  load: loadPersistedOnboarding,
  clear: clearOnboardingState,
  hasIncomplete: hasIncompleteOnboarding,
  getResumeStep,
  recordAbandon,
  getAbandonCount,
  getAbandonHistory,
  getLastAbandonedStep,
  isHighAbandonRisk,
  recordCompletionAttempt,
  getCompletionAttempts,
  getPartialData,
};