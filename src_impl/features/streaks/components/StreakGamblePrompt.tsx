/**
 * StreakGamblePrompt
 * Barrel re-export from split modules.
 */

export { StreakGamblePrompt as default, StreakGamblePrompt } from './gamble-states';

export {
  CRITICAL_HOURS_THRESHOLD,
  GAMBLE_SUCCESS_GRADES,
  GAMBLE_BONUS_XP,
  type StreakGamblePromptProps,
  type GambleState,
  type GambleOutcome,
} from './gamble-types';

export {
  trackStreakGambleDecision,
  useShouldShowGamblePrompt,
  getRiskText,
  calculateGambleOutcome,
  type RiskColors,
} from './gamble-logic';

export {
  usePulseAnimation,
  useShakeAnimation,
  useGlowAnimation,
  useCountdownAnimation,
} from './gamble-animations';

export { GamblePromptView } from './gamble-prompt-view';
