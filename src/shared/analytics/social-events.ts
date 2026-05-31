export const SocialEvents = {
  SQUAD_JOINED: 'squad_joined',
  SQUAD_LEFT: 'squad_left',
  SQUAD_WAR_VIEWED: 'squad_war_viewed',
  ACTIVITY_POSTED: 'activity_posted',
  FRIEND_REQUEST_SENT: 'friend_request_sent',
  FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',
  LEADERBOARD_VIEWED: 'leaderboard_viewed',
  PROFILE_VIEWED: 'profile_viewed',
  MESSAGE_SENT: 'message_sent',
  INVITE_SHARED: 'invite_shared',
  FRIENDLY_DUEL_COMPLETED: 'friendly_duel_completed',
  DUEL_CHALLENGE_SENT: 'duel_challenge_sent',
  DUEL_ACCEPTED: 'duel_accepted',
  DUEL_WON: 'duel_won',
  DUEL_LOST: 'duel_lost',
  DUEL_MATCHMAKING_JOINED: 'duel_matchmaking_joined',
  DUEL_MATCHMAKING_LEFT: 'duel_matchmaking_left',
  DUEL_MATCH_FOUND: 'duel_match_found',
  DUEL_MATCHMAKING_TIMEOUT: 'duel_matchmaking_timeout',
  DUEL_CHALLENGE_DECLINED: 'duel_challenge_declined',
  DUEL_CHALLENGE_ACCEPTED: 'duel_challenge_accepted',
  DUEL_CHALLENGE_CANCELLED: 'duel_challenge_cancelled',
  DUEL_CHALLENGE_NOTIFICATION_SENT: 'duel_challenge_notification_sent',
  DUEL_ACTIVE_SCREEN_VIEWED: 'duel_active_screen_viewed',
  DUEL_FORFEITED: 'duel_forfeited',
  DUEL_START_SESSION_CLICKED: 'duel_start_session_clicked',
  DUEL_REMATCH_REQUESTED: 'duel_rematch_requested',
  DUEL_RESULT_SHARED: 'duel_result_shared',
} as const;
export type SocialEvent = (typeof SocialEvents)[keyof typeof SocialEvents];

export const CoachEvents = {
  COACH_MESSAGE_RECEIVED: 'coach_message_received',
  COACH_TIP_VIEWED: 'coach_tip_viewed',
  COMEBACK_SESSION_SUGGESTED: 'comeback_session_suggested',
  REMINDER_SET: 'reminder_set',
  COACH_QUESTION_ASKED: 'coach_question_asked',
  COACH_QUESTION_ANSWERED: 'coach_question_answered',
  COACH_CTA_CLICKED: 'coach_cta_clicked',
  COACH_SCREEN_OPENED: 'coach_screen_opened',
  COACH_SCREEN_CLOSED: 'coach_screen_closed',
  COACH_PERSONALITY_CHANGED: 'coach_personality_changed',
} as const;
export type CoachEvent = (typeof CoachEvents)[keyof typeof CoachEvents];

export const StreakEvents = {
  STREAK_UPDATED: 'streak_updated',
  STREAK_BROKEN: 'streak_broken',
  STREAK_FREEZE_USED: 'streak_freeze_used',
  STREAK_RISK_ACTIVATED: 'streak_risk_activated',
  STREAK_MILESTONE_REACHED: 'streak_milestone_reached',
} as const;
export type StreakEvent = (typeof StreakEvents)[keyof typeof StreakEvents];

export const RetentionEvents = {
  STREAK_MAINTAINED: 'streak_maintained',
  STREAK_RECOVERED: 'streak_recovered',
  RIVAL_WIDGET_VIEWED: 'rival_widget_viewed',
  SESSION_REMINDER_TRIGGERED: 'session_reminder_triggered',
  COMEBACK_OFFER_VIEWED: 'comeback_offer_viewed',
  COMEBACK_OFFER_ACCEPTED: 'comeback_offer_accepted',
  DAY_1_RETURN: 'day_1_return',
  DAY_7_RETURN: 'day_7_return',
} as const;
export type RetentionEvent =
  (typeof RetentionEvents)[keyof typeof RetentionEvents];
