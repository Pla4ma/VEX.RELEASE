/**
 * Onboarding Actions
 *
 * Step navigation, user preference saving, and onboarding flow control.
 * Dependencies: user profile updates, session creation
 */

import { useOnboardingStore } from './store';
import type { FocusGoal, FocusDuration } from './schemas';

// ============================================================================
// Step Navigation
// ============================================================================

const STEP_ORDER = ['WELCOME', 'GOAL_SETTING', 'FOCUS_TIME', 'NAME_SETUP', 'FIRST_SESSION_CTA'] as const;

export function getStepName(stepNumber: number): (typeof STEP_ORDER)[number] {
  return STEP_ORDER[stepNumber] ?? 'WELCOME';
}

export function canGoBack(stepNumber: number): boolean {
  return stepNumber > 0;
}

export function canSkip(stepNumber: number): boolean {
  return stepNumber >= 1;
}

// ============================================================================
// Onboarding Actions
// ============================================================================

export function saveGoal(goal: FocusGoal): void {
  useOnboardingStore.getState().setGoal(goal);
}

export function saveFocusDuration(duration: FocusDuration): void {
  useOnboardingStore.getState().setFocusDuration(duration);
}

export function saveDisplayName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return false;
  }
  useOnboardingStore.getState().setDisplayName(trimmed);
  return true;
}

export function goToNextStep(): void {
  useOnboardingStore.getState().nextStep();
}

export function goToPreviousStep(): void {
  useOnboardingStore.getState().previousStep();
}

export function skipOnboarding(): void {
  useOnboardingStore.getState().skipOnboarding();
}

export function completeOnboarding(): void {
  useOnboardingStore.getState().completeOnboarding();
}

// ============================================================================
// Phase 3: First Session Gate
// ============================================================================

export class OnboardingError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'OnboardingError';
  }
}

export async function completeOnboardingWithGate(userId: string): Promise<void> {
  const { onboardingRepository } = await import('./repository');
  const state = await onboardingRepository.getProgress(userId);

  if (!state || !state.steps.firstSessionCompleted) {
    throw new OnboardingError(
      'ONBOARDING_INCOMPLETE',
      'Complete your first session to finish onboarding'
    );
  }

  await onboardingRepository.saveProgress(userId, {
    ...state,
    status: 'COMPLETED',
  });
}

export function resetOnboarding(): void {
  useOnboardingStore.getState().resetOnboarding();
}
