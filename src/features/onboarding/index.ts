/**
 * Onboarding Feature
 *
 * 5-step onboarding flow for D1 retention.
 * Welcome → Goal → Focus Time → Name → First Session
 *
 * @phase 2
 */

export * from './schemas';
export * from './constants';
export * from './store';
export * from './store-hooks';
export * from './service';
export * from './components';
export * from './repository';
export * from './utils';
export * from './language-tier';
export * from './reward-alignment';

// Phase 5.3 - Progressive Onboarding
export {
  initializeOnboarding,
  getOnboardingState,
  advanceStep,
  skipToFirstSession,
  recordSession,
  markFeatureIntroduced,
  getStepContent,
  getOnboardingProgress,
  shouldShowOnboarding,
  isFeatureAvailable,
  getAvailableFeatures,
  getNextFeatureUnlock,
  FEATURE_UNLOCK_GATES,
  STEP_CONTENT,
  type OnboardingState,
  type OnboardingStep,
  type UserPreferences,
  type UnlockedFeature,
  type FeatureUnlockGate,
  type OnboardingProgress,
  type StepContent,
} from './ProgressiveOnboarding';
