import type { FirstWeekStage } from './first-week-schemas';

export const STAGE_TO_EMPHASIS: Record<FirstWeekStage, string> = {
  DAY_0_NOT_STARTED: 'confirmation_coach_next_action',
  DAY_0_FIRST_SESSION_STARTED: 'confirmation_coach_next_action',
  DAY_1_RETURN: 'confirmation_progress_next_action',
  DAY_2_PROGRESS_PROOF: 'confirmation_proof_next_action',
  DAY_3_COMPANION_CONNECTION: 'confirmation_companion_next_action',
  DAY_4_RECOVERY: 'confirmation_recovery_next_action',
  DAY_5_PATH_FORMING: 'confirmation_coach_progress_next_action',
  DAY_6_WEEKLY_PREP: 'confirmation_anticipation_next_action',
  DAY_7_DEEPER_MODE: 'confirmation_weekly_intelligence_next_action',
  POST_DAY_7: 'confirmation_coach_progress_next_action',
};
