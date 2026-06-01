export const AuthEvents = {
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  LOGIN_FAILED: 'login_failed',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
} as const;
export type AuthEvent = (typeof AuthEvents)[keyof typeof AuthEvents];

export const SessionEvents = {
  SESSION_STARTED: 'session_started',
  SESSION_COMPLETED: 'session_completed',
  SESSION_ABANDONED: 'session_abandoned',
  SESSION_PAUSED: 'session_paused',
  SESSION_RESUMED: 'session_resumed',
  SESSION_EXTENDED: 'session_extended',
  FOCUS_INTERVAL_COMPLETED: 'focus_interval_completed',
  BOSS_BATTLE_STARTED: 'boss_battle_started',
  BOSS_BATTLE_COMPLETED: 'boss_battle_completed',
  BOSS_BATTLE_FAILED: 'boss_battle_failed',
} as const;
export type SessionEvent = (typeof SessionEvents)[keyof typeof SessionEvents];

export const ProgressionEvents = {
  XP_GRANTED: 'xp_granted',
  XP_GAINED: 'xp_gained',
  LEVEL_UP: 'level_up',
  STREAK_UPDATED: 'streak_updated',
  STREAK_BROKEN: 'streak_broken',
  STREAK_MILESTONE_REACHED: 'streak_milestone_reached',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  RANK_CHANGED: 'rank_changed',
} as const;
export type ProgressionEvent =
  (typeof ProgressionEvents)[keyof typeof ProgressionEvents];

export const FeatureEvents = {
  SETTINGS_CHANGED: 'settings_changed',
  TUTORIAL_COMPLETED: 'tutorial_completed',
  TUTORIAL_SKIPPED: 'tutorial_skipped',
  HELP_CENTER_OPENED: 'help_center_opened',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  NETWORK_STATUS_CHANGED: 'network_status_changed',
  BANNER_DISMISSED: 'banner_dismissed',
  BANNER_REAPPEARED: 'banner_reappeared',
} as const;
export type FeatureEvent = (typeof FeatureEvents)[keyof typeof FeatureEvents];

export const OnboardingEvents = {
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_GOAL_SET: 'onboarding_goal_set',
  ONBOARDING_FIRST_SESSION_STARTED: 'onboarding_first_session_started',
  ONBOARDING_FIRST_SESSION_COMPLETED: 'onboarding_first_session_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_STEP_VIEWED: 'onboarding_step_viewed',
  ONBOARDING_STEP_SKIPPED: 'onboarding_step_skipped',
} as const;
export type OnboardingEvent =
  (typeof OnboardingEvents)[keyof typeof OnboardingEvents];
