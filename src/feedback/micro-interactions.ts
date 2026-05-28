/**
 * Micro-interactions — haptic, animation, sound, and visual feedback patterns.
 * Split into domain-specific files for maintainability.
 */

export {
  HAPTIC_PATTERNS,
  ANIMATION_PATTERNS,
  SOUND_EFFECTS,
} from "./feedbackPatterns";

export { triggerFeedback, type FeedbackEvent } from "./feedbackTrigger";

export {
  getLoadingState,
  getErrorRecovery,
  type LoadingState,
  type ErrorRecovery,
} from "./feedbackHelpers";
