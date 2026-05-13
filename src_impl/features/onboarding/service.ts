/**
 * Onboarding Service
 *
 * Business logic and orchestration for onboarding flow.
 * Re-exports from domain-split service modules.
 */

export {
  getStepName,
  canGoBack,
  canSkip,
  saveGoal,
  saveFocusDuration,
  saveDisplayName,
  goToNextStep,
  goToPreviousStep,
  skipOnboarding,
  completeOnboarding,
  OnboardingError,
  completeOnboardingWithGate,
  resetOnboarding,
} from './onboarding-actions';

export {
  GOAL_OPTIONS,
  DURATION_OPTIONS,
  getFirstSessionConfig,
  isOnboardingStalled,
  getEstimatedTimeRemaining,
} from './onboarding-config';
