export { default as StreakGamblePrompt } from './StreakGamblePrompt';
export {
  trackStreakGambleDecision,
  useShouldShowGamblePrompt,
} from './helpers';
export {
  CRITICAL_HOURS_THRESHOLD,
  GAMBLE_SUCCESS_GRADES,
  GAMBLE_BONUS_XP,
} from './types';
export type {
  StreakGamblePromptProps,
  GambleState,
  GambleOutcome,
} from './types';
