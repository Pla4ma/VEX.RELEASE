/**
 * Notification safe action intents — never raw route strings from notification payloads.
 *
 * Every notification resolves to one of these safe intents.
 * Route mapping happens only after FeatureAvailability checks.
 */
export type NotificationSafeIntent =
  | 'OPEN_HOME'
  | 'START_SESSION'
  | 'OPEN_PROGRESS'
  | 'OPEN_COACH'
  | 'OPEN_STUDY_LAYER'
  | 'OPEN_BOSS'
  | 'OPEN_SETTINGS';

export type NotificationActionType =
  | 'start_session'
  | 'view_boss'
  | 'open_chest'
  | 'view_squad'
  | 'join_duel'
  | 'view_streak'
  | 'open_shop'
  | 'view_profile'
  | 'open_coach'
  | 'accept_invite'
  | 'view_progress'
  | 'custom';

export interface NotificationRouteResult {
  success: boolean;
  screen?: string;
  params?: Record<string, unknown>;
  error?: string;
}

export interface NotificationAction {
  type: NotificationActionType;
  payload?: Record<string, unknown>;
}

export interface SafeNotificationResolution {
  intent: NotificationSafeIntent;
  params?: Record<string, unknown>;
  fallbackReason?: string;
}
