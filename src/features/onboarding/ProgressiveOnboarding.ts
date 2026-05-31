// Re-export all types and constants for backward compatibility
export type {
  OnboardingStep,
  OnboardingState,
  UserPreferences,
  UnlockedFeature,
  FeatureUnlockGate,
  StepContent,
  OnboardingProgress,
} from './onboarding-types';
export { FEATURE_UNLOCK_GATES, STEP_CONTENT, STEP_ORDER } from './onboarding-gates';

export {
  initializeOnboarding,
  getOnboardingState,
  advanceStep,
  skipToFirstSession,
  recordSession,
} from './onboarding-state';

export {
  markFeatureIntroduced,
  getStepContent,
  getOnboardingProgress,
  shouldShowOnboarding,
  isFeatureAvailable,
  getAvailableFeatures,
  getNextFeatureUnlock,
} from './onboarding-progress';
