export const AuthEvents = {
  USER_SIGNED_UP: "user_signed_up",
  USER_LOGGED_IN: "user_logged_in",
  USER_LOGGED_OUT: "user_logged_out",
  LOGIN_FAILED: "login_failed",
  PASSWORD_RESET_REQUESTED: "password_reset_requested",
  PASSWORD_RESET_COMPLETED: "password_reset_completed",
} as const;
export type AuthEvent = (typeof AuthEvents)[keyof typeof AuthEvents];
export const SessionEvents = {
  SESSION_STARTED: "session_started",
  SESSION_COMPLETED: "session_completed",
  SESSION_ABANDONED: "session_abandoned",
  SESSION_PAUSED: "session_paused",
  SESSION_RESUMED: "session_resumed",
  SESSION_EXTENDED: "session_extended",
  FOCUS_INTERVAL_COMPLETED: "focus_interval_completed",
  BOSS_BATTLE_STARTED: "boss_battle_started",
  BOSS_BATTLE_COMPLETED: "boss_battle_completed",
  BOSS_BATTLE_FAILED: "boss_battle_failed",
} as const;
export type SessionEvent = (typeof SessionEvents)[keyof typeof SessionEvents];
export const ProgressionEvents = {
  XP_GRANTED: "xp_granted",
  XP_GAINED: "xp_gained",
  LEVEL_UP: "level_up",
  STREAK_UPDATED: "streak_updated",
  STREAK_BROKEN: "streak_broken",
  STREAK_MILESTONE_REACHED: "streak_milestone_reached",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
  RANK_CHANGED: "rank_changed",
} as const;
export type ProgressionEvent =
  (typeof ProgressionEvents)[keyof typeof ProgressionEvents];
export const EconomyEvents = {
  REWARD_CLAIMED: "reward_claimed",
  CURRENCY_GRANTED: "currency_granted",
  CURRENCY_SPENT: "currency_spent",
  ITEM_PURCHASED: "item_purchased",
  CURRENCY_EARNED: "currency_earned",
  CURRENCY_CONVERTED: "currency_converted",
  ITEM_CRAFTED: "item_crafted",
  ITEM_USED: "item_used",
  INVENTORY_FULL: "inventory_full",
  SHOP_VIEWED: "shop_viewed",
  OFFER_CLAIMED: "offer_claimed",
  PAYWALL_VIEWED: "paywall_viewed",
  PAYWALL_DISMISSED: "paywall_dismissed",
  OFFERING_LOADED: "offering_loaded",
  OFFERING_LOAD_FAILED: "offering_load_failed",
  OFFERING_EMPTY: "offering_empty",
  PURCHASE_STARTED: "purchase_started",
  PURCHASE_COMPLETED: "purchase_completed",
  PURCHASE_FAILED: "purchase_failed",
  PURCHASE_CANCELLED: "purchase_cancelled",
  RESTORE_STARTED: "restore_started",
  RESTORE_COMPLETED: "restore_completed",
  RESTORE_FAILED: "restore_failed",
  RESTORE_EMPTY: "restore_empty",
  ENTITLEMENT_ACTIVATED: "entitlement_activated",
  ENTITLEMENT_REVOKED: "entitlement_revoked",
  ENTITLEMENT_EXPIRED: "entitlement_expired",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_EXPIRED: "subscription_expired",
  SUBSCRIPTION_RENEWED: "subscription_renewed",
  PREMIUM_REWARD_UNLOCKED: "premium_reward_unlocked",
  PREMIUM_TRIAL_CLAIMED: "premium_trial_claimed",
  PREMIUM_TRIAL_EXPIRED: "premium_trial_expired",
} as const;
export type EconomyEvent = (typeof EconomyEvents)[keyof typeof EconomyEvents];
export type PurchaseEvent = EconomyEvent;
export const RewardEvents = {
  REWARD_CLAIMED: "reward_claimed",
  REWARD_AVAILABLE: "reward_available",
  DAILY_BONUS_CLAIMED: "daily_bonus_claimed",
  STREAK_BONUS_CLAIMED: "streak_bonus_claimed",
  LEVEL_BONUS_CLAIMED: "level_bonus_claimed",
} as const;
export type RewardEvent = (typeof RewardEvents)[keyof typeof RewardEvents];
export const StreakEvents = {
  STREAK_UPDATED: "streak_updated",
  STREAK_BROKEN: "streak_broken",
  STREAK_FREEZE_USED: "streak_freeze_used",
  STREAK_RISK_ACTIVATED: "streak_risk_activated",
  STREAK_MILESTONE_REACHED: "streak_milestone_reached",
} as const;
export type StreakEvent = (typeof StreakEvents)[keyof typeof StreakEvents];
export const SocialEvents = {
  SQUAD_JOINED: "squad_joined",
  SQUAD_LEFT: "squad_left",
  SQUAD_WAR_VIEWED: "squad_war_viewed",
  ACTIVITY_POSTED: "activity_posted",
  FRIEND_REQUEST_SENT: "friend_request_sent",
  FRIEND_REQUEST_ACCEPTED: "friend_request_accepted",
  LEADERBOARD_VIEWED: "leaderboard_viewed",
  PROFILE_VIEWED: "profile_viewed",
  MESSAGE_SENT: "message_sent",
  INVITE_SHARED: "invite_shared",
  FRIENDLY_DUEL_COMPLETED: "friendly_duel_completed",
  DUEL_CHALLENGE_SENT: "duel_challenge_sent",
  DUEL_ACCEPTED: "duel_accepted",
  DUEL_WON: "duel_won",
  DUEL_LOST: "duel_lost",
  DUEL_MATCHMAKING_JOINED: "duel_matchmaking_joined",
  DUEL_MATCHMAKING_LEFT: "duel_matchmaking_left",
  DUEL_MATCH_FOUND: "duel_match_found",
  DUEL_MATCHMAKING_TIMEOUT: "duel_matchmaking_timeout",
  DUEL_CHALLENGE_DECLINED: "duel_challenge_declined",
  DUEL_CHALLENGE_ACCEPTED: "duel_challenge_accepted",
  DUEL_CHALLENGE_CANCELLED: "duel_challenge_cancelled",
  DUEL_CHALLENGE_NOTIFICATION_SENT: "duel_challenge_notification_sent",
  DUEL_ACTIVE_SCREEN_VIEWED: "duel_active_screen_viewed",
  DUEL_FORFEITED: "duel_forfeited",
  DUEL_START_SESSION_CLICKED: "duel_start_session_clicked",
  DUEL_REMATCH_REQUESTED: "duel_rematch_requested",
  DUEL_RESULT_SHARED: "duel_result_shared",
} as const;
export type SocialEvent = (typeof SocialEvents)[keyof typeof SocialEvents];
export const CoachEvents = {
  COACH_MESSAGE_RECEIVED: "coach_message_received",
  COACH_TIP_VIEWED: "coach_tip_viewed",
  COMEBACK_SESSION_SUGGESTED: "comeback_session_suggested",
  REMINDER_SET: "reminder_set",
  COACH_QUESTION_ASKED: "coach_question_asked",
  COACH_QUESTION_ANSWERED: "coach_question_answered",
  COACH_CTA_CLICKED: "coach_cta_clicked",
  COACH_SCREEN_OPENED: "coach_screen_opened",
  COACH_SCREEN_CLOSED: "coach_screen_closed",
  COACH_PERSONALITY_CHANGED: "coach_personality_changed",
} as const;
export type CoachEvent = (typeof CoachEvents)[keyof typeof CoachEvents];
export const FeatureEvents = {
  SETTINGS_CHANGED: "settings_changed",
  TUTORIAL_COMPLETED: "tutorial_completed",
  TUTORIAL_SKIPPED: "tutorial_skipped",
  HELP_CENTER_OPENED: "help_center_opened",
  FEEDBACK_SUBMITTED: "feedback_submitted",
  NETWORK_STATUS_CHANGED: "network_status_changed",
  BANNER_DISMISSED: "banner_dismissed",
  BANNER_REAPPEARED: "banner_reappeared",
} as const;
export type FeatureEvent = (typeof FeatureEvents)[keyof typeof FeatureEvents];
export const OnboardingEvents = {
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_GOAL_SET: "onboarding_goal_set",
  ONBOARDING_FIRST_SESSION_STARTED: "onboarding_first_session_started",
  ONBOARDING_FIRST_SESSION_COMPLETED: "onboarding_first_session_completed",
  ONBOARDING_COMPLETED: "onboarding_completed",
  ONBOARDING_STEP_VIEWED: "onboarding_step_viewed",
  ONBOARDING_STEP_SKIPPED: "onboarding_step_skipped",
} as const;
export type OnboardingEvent =
  (typeof OnboardingEvents)[keyof typeof OnboardingEvents];
export const PurchaseFunnelEvents = {
  PAYWALL_VIEWED: "paywall_viewed",
  PACKAGE_SELECTED: "package_selected",
  PURCHASE_STARTED: "purchase_started",
  PURCHASE_SUCCEEDED: "purchase_succeeded",
  PURCHASE_FAILED: "purchase_failed",
  PURCHASE_RESTORED: "purchase_restored",
} as const;
export type PurchaseFunnelEvent =
  (typeof PurchaseFunnelEvents)[keyof typeof PurchaseFunnelEvents];
export const RetentionEvents = {
  STREAK_MAINTAINED: "streak_maintained",
  STREAK_RECOVERED: "streak_recovered",
  RIVAL_WIDGET_VIEWED: "rival_widget_viewed",
  SESSION_REMINDER_TRIGGERED: "session_reminder_triggered",
  COMEBACK_OFFER_VIEWED: "comeback_offer_viewed",
  COMEBACK_OFFER_ACCEPTED: "comeback_offer_accepted",
  DAY_1_RETURN: "day_1_return",
  DAY_7_RETURN: "day_7_return",
} as const;
export type RetentionEvent =
  (typeof RetentionEvents)[keyof typeof RetentionEvents];
export const AnalyticsEvents = {
  ...AuthEvents,
  ...SessionEvents,
  ...ProgressionEvents,
  ...EconomyEvents,
  ...SocialEvents,
  ...CoachEvents,
  ...FeatureEvents,
  ...OnboardingEvents,
  ...PurchaseFunnelEvents,
  ...RetentionEvents,
} as const;
export type AnalyticsEvent =
  | AuthEvent
  | SessionEvent
  | ProgressionEvent
  | EconomyEvent
  | SocialEvent
  | CoachEvent
  | FeatureEvent
  | OnboardingEvent
  | PurchaseFunnelEvent
  | RetentionEvent
  | "funnel_step_completed"
  | "retention_event"
  | "subscription_cancelled"
  | "alert_triggered"
  | "exception_captured"
  | "session_configured"
  | "coach_cta_effectiveness";
export interface BaseEventProperties {
  [key: string]: unknown;
  user_id?: string;
  session_id?: string;
  timestamp?: number;
  outcome?: "success" | "failure";
  error_message?: string;
  platform?: "ios" | "android" | "web";
  app_version?: string;
  is_connected?: boolean;
  connection_type?: string;
  banner_type?: string;
  duration_until_reappear_sec?: number;
  reason?: string;
  is_subscription?: boolean;
  period?: string;
  category?: string;
  action?: string;
  cta_type?: string;
  session_duration?: number;
  sessionId?: string;
  day?: number;
  duration?: number;
  targetUsers?: string[];
  war_id?: string;
}
export interface AuthEventProperties extends BaseEventProperties {
  method?: "email" | "google" | "apple" | "anonymous";
  is_new_user?: boolean;
}
export interface SessionEventProperties extends BaseEventProperties {
  duration_seconds?: number;
  completion_percentage?: number;
  session_type?: "focus" | "boss" | "challenge";
  difficulty?: "easy" | "medium" | "hard";
  intervals_completed?: number;
  total_intervals?: number;
  was_paused?: boolean;
  pause_duration_seconds?: number;
  xp_earned?: number;
  coins_earned?: number;
}
export interface ProgressionEventProperties extends BaseEventProperties {
  xp_amount?: number;
  previous_level?: number;
  new_level?: number;
  streak_days?: number;
  previous_streak?: number;
  achievement_id?: string;
  achievement_name?: string;
  rank?: string;
}
export interface EconomyEventProperties extends BaseEventProperties {
  currency_type?: "coins" | "gems" | "seasonal";
  amount?: number;
  item_id?: string;
  item_name?: string;
  item_type?: string;
  item_rarity?: string;
  shop_category?: string;
  source?: string;
  balance_after?: number;
  package_id?: string;
  offering_id?: string;
  product_id?: string;
  price?: number;
  currency?: string;
  is_restore?: boolean;
  has_intro_offer?: boolean;
  intro_price?: number;
  success?: boolean;
  error_code?: string;
  error_message?: string;
  found_entitlements?: boolean;
  entitlement_count?: number;
  paywall_source?: string;
  gated_feature?: string;
  number_of_packages?: number;
  has_free_trial?: boolean;
  package_count?: number;
  available_package_types?: string[];
  has_lifetime?: boolean;
  has_subscription?: boolean;
  entitlement_id?: string;
  is_active?: boolean;
  will_renew?: boolean;
  expiration_date?: string;
  achievement_type?: string;
  trial_days?: number;
  trial_ends_at?: number;
}
export interface SocialEventProperties extends BaseEventProperties {
  squad_id?: string;
  squad_name?: string;
  friend_id?: string;
  challenge_id?: string;
  challenge_name?: string;
  post_type?: string;
  leaderboard_type?: string;
  rank_position?: number;
  duel_id?: string;
  duel_type?: "TIMED" | "QUALITY" | "ENDURANCE";
  challenger_id?: string;
  challenged_id?: string;
  opponent_id?: string;
  player1_id?: string;
  player2_id?: string;
  stake_amount?: number;
  rating?: number;
  rating_delta?: number;
  wait_time_ms?: number;
  is_winner?: boolean;
  xp_gained?: number;
}
export interface CoachEventProperties extends BaseEventProperties {
  message_type?: "tip" | "encouragement" | "reminder" | "comeback";
  tip_category?: string;
  was_helpful?: boolean;
}
export type EventProperties = object;
