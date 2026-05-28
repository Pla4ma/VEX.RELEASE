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
