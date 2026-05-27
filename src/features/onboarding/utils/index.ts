/**
 * Onboarding Utilities - Barrel Export
 *
 * @phase 2 - Deepening: Utility organization
 */

export { OnboardingValidation } from "./validation";
export {
  validateOnboardingStep,
  validateCompleteOnboarding,
  GoalValidators,
  DurationValidators,
  NameValidators,
  getNextRecommendedStep,
  canSkipStep,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
} from "./validation";

export { OnboardingPersistence } from "./persistence";
export {
  persistOnboardingState,
  loadPersistedOnboarding,
  hasIncompleteOnboarding,
  getResumeStep,
  recordAbandon,
  getAbandonCount,
  isHighAbandonRisk,
  getPartialData,
} from "./persistence";
