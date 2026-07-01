/**
 * Notification safe action intents — never raw route strings from notification payloads.
 *
 * Every notification resolves to one of these safe intents.
 * Route mapping happens only after FeatureAvailability checks.
 */
import type { SessionStackParams } from './types';
import type { ExtendedRootStackParams, RootStackParams } from './param-types';
import { navigateToRootScreen } from './navigation-helpers';
import type { NavigationProp } from '@react-navigation/native';

export type NotificationSafeIntent =
  | 'OPEN_HOME'
  | 'START_SESSION'
  | 'START_RESCUE'
  | 'OPEN_PROGRESS'
  | 'OPEN_PROFILE'
  | 'OPEN_COACH'
  | 'OPEN_STUDY_LAYER'
  | 'OPEN_BOSS'
  | 'OPEN_SETTINGS';

export type NotificationActionType =
  | 'start_session'
  | 'start_rescue'
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

export interface NotificationNavigation {
  navigate<T extends keyof ExtendedRootStackParams>(
    screen: T,
    params?: ExtendedRootStackParams[T],
  ): void;
}

export const ALLOWED_MAIN_TAB_SCREENS = new Set([
  'Home',
  'Progress',
  'Profile',
]);
export const ALLOWED_ROOT_SCREENS = new Set([
  'ContentStudy',
  'AICoach',
  'Mastery',
]);

export const validTypes: NotificationActionType[] = [
  'start_session',
  'start_rescue',
  'view_boss',
  'open_chest',
  'view_squad',
  'join_duel',
  'view_streak',
  'open_shop',
  'view_profile',
  'open_coach',
  'accept_invite',
  'view_progress',
  'custom',
];

export function blocked(screen: string): NotificationRouteResult {
  return {
    success: false,
    error: `${screen} is not available yet`,
    screen: 'Home',
  };
}

export function navigateToSessionSetup(
  navigation: NotificationNavigation,
  payload?: Record<string, unknown>,
): NotificationRouteResult {
  const params: SessionStackParams['SessionSetup'] = {
    presetId: toOptionalString(payload?.presetId),
    comebackMultiplier: toOptionalNumber(payload?.comebackMultiplier),
    presetMode: payload?.presetMode === 'STUDY' ? 'STUDY' : undefined,
    source: payload?.source === 'content-study' ? 'content-study' : undefined,
  };
  navigateToRootScreen(navigation as NavigationProp<RootStackParams>, 'SessionStack', { screen: 'SessionSetup', params } as RootStackParams['SessionStack']);
  return { success: true, screen: 'SessionSetup' };
}

export function navigateToRescueSession(
  navigation: NotificationNavigation,
  payload?: Record<string, unknown>,
): NotificationRouteResult {
  const params: SessionStackParams['SessionSetup'] = {
    source: 'rescue',
    rescuePlanId: toOptionalString(payload?.rescuePlanId),
    rescueTaskDescription: toOptionalString(payload?.rescueTaskDescription),
    suggestedDurationSeconds: toOptionalNumber(
      payload?.suggestedDurationSeconds,
    ),
  };
  navigateToRootScreen(navigation as NavigationProp<RootStackParams>, 'SessionStack', { screen: 'SessionSetup', params } as RootStackParams['SessionStack']);
  return { success: true, screen: 'SessionSetup' };
}

export function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}
