import type { SessionStackParams } from './types';
import type {
  NotificationAction,
  NotificationActionType,
  NotificationRouteResult,
  NotificationSafeIntent,
} from './notification-routing-types';
import type { SafeNotificationResolution } from './notification-routing-types';
import { isFeatureHidden } from '../features/liveops-config/final-release-feature-map';
import { canUseFeature, type FeatureAccessCheck } from './notification-filters';

export type { FeatureAccessCheck } from './notification-filters';

interface NotificationNavigation {
  navigate(screen: string, params?: object | undefined): void;
}

const ALLOWED_MAIN_TAB_SCREENS = new Set(['Home', 'Progress', 'Profile']);
const ALLOWED_ROOT_SCREENS = new Set(['ContentStudy', 'AICoach', 'Mastery']);

function blocked(screen: string): NotificationRouteResult {
  return { success: false, error: `${screen} is not available yet`, screen: 'Home' };
}

/**
 * Resolves a notification action to a safe intent.
 * Safe intents are never raw route strings — they represent user-facing actions.
 * The actual route mapping happens after FeatureAvailability checks.
 */
export function resolveNotificationAction(
  action: NotificationAction,
  featureAccess?: FeatureAccessCheck,
  motivationStyle?: string | null,
): SafeNotificationResolution {
  switch (action.type) {
    case 'start_session':
    case 'view_streak':
      return { intent: 'START_SESSION', params: action.payload };
    case 'view_boss': {
      if (isFeatureHidden('boss_tab')) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Boss feature is not available in final release' };
      }
      const bossAvailable = canUseFeature(featureAccess, 'boss_tab');
      if (!bossAvailable) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Boss feature is not available yet' };
      }
      const isGameUser = motivationStyle === 'game_like' || motivationStyle === 'intense';
      return { intent: 'OPEN_BOSS', params: { subtle: !isGameUser } };
    }
    case 'view_squad':
    case 'join_duel': {
      if (isFeatureHidden('squads')) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Squads are not available in final release' };
      }
      const squadsAvailable = canUseFeature(featureAccess, 'squads');
      if (!squadsAvailable) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Squads are not available yet' };
      }
      return { intent: 'OPEN_HOME', fallbackReason: 'Squad actions redirect to Home while social is limited' };
    }
    case 'open_shop': {
      if (isFeatureHidden('shop')) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Shop is not available in final release' };
      }
      const shopAvailable = canUseFeature(featureAccess, 'shop');
      if (!shopAvailable) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Shop is not available' };
      }
      return { intent: 'OPEN_HOME', fallbackReason: 'Shop redirects to Home' };
    }
    case 'open_chest':
      if (isFeatureHidden('inventory')) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Chests are not available in final release' };
      }
      return { intent: 'OPEN_HOME', fallbackReason: 'Chest opening redirects to Home' };
    case 'open_coach': {
      if (isFeatureHidden('ai_coach_advanced')) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Coach is not available in final release' };
      }
      const coachAvailable = canUseFeature(featureAccess, 'ai_coach_advanced');
      if (!coachAvailable) {
        return { intent: 'OPEN_HOME', fallbackReason: 'AICoach is not available yet' };
      }
      return { intent: 'OPEN_COACH', params: action.payload };
    }
    case 'view_progress':
    case 'accept_invite':
      return { intent: 'OPEN_PROGRESS', params: action.payload };
    case 'view_profile':
      return { intent: 'OPEN_PROFILE', params: action.payload };
    // custom always returns OPEN_HOME (Option A — safest final release):
    // No raw route strings from notification payloads are allowed to navigate directly.
    // All real notification routes must use explicit safe action types (start_session, view_boss, etc.).
    // The whitelist check below exists as a defense-in-depth audit trail but does not change
    // the routing outcome — custom screens always fall back to Home.
    case 'custom': {
      const screen = toOptionalString(action.payload?.screen);
      if (!screen) return { intent: 'OPEN_HOME' };
      if (!ALLOWED_MAIN_TAB_SCREENS.has(screen) && !ALLOWED_ROOT_SCREENS.has(screen)) {
        return { intent: 'OPEN_HOME', fallbackReason: `Screen ${screen} is not whitelisted` };
      }
      return { intent: 'OPEN_HOME', fallbackReason: 'custom type always routes Home in final release' };
    }
    default:
      return { intent: 'OPEN_HOME' };
  }
}

/**
 * Returns the list of notification filter types that should be shown
 * given the current feature availability.
 */
export { getAvailableNotificationFilters } from './notification-filters';

function navigateFromSafeIntent(
  navigation: NotificationNavigation,
  intent: NotificationSafeIntent,
  params?: Record<string, unknown>,
  featureAccess?: FeatureAccessCheck,
): NotificationRouteResult {
  switch (intent) {
    case 'START_SESSION':
      return navigateToSessionSetup(navigation, params);
    case 'OPEN_BOSS': {
      if (!canUseFeature(featureAccess, 'boss_tab')) return blocked('Boss');
      navigation.navigate('Boss', undefined);
      return { success: true, screen: 'Boss' };
    }
    case 'OPEN_PROGRESS':
      navigation.navigate('Main', { screen: 'Progress' });
      return { success: true, screen: 'Progress' };
    case 'OPEN_PROFILE':
      navigation.navigate('Main', { screen: 'Profile' });
      return { success: true, screen: 'Profile' };
    case 'OPEN_COACH': {
      if (!canUseFeature(featureAccess, 'ai_coach_advanced')) return blocked('AICoach');
      navigation.navigate('AICoach', undefined);
      return { success: true, screen: 'AICoach' };
    }
    case 'OPEN_STUDY_LAYER': {
      if (!canUseFeature(featureAccess, 'content_study')) return blocked('ContentStudy');
      navigation.navigate('ContentStudy', undefined);
      return { success: true, screen: 'ContentStudy' };
    }
    case 'OPEN_SETTINGS':
      navigation.navigate('Settings', {});
      return { success: true, screen: 'Settings' };
    case 'OPEN_HOME':
    default:
      navigation.navigate('Main', { screen: 'Home' });
      return { success: true, screen: 'Home' };
  }
}

export function routeNotificationAction(
  navigation: NotificationNavigation | null | undefined,
  action: NotificationAction,
  featureAccess?: FeatureAccessCheck,
  motivationStyle?: string | null,
): NotificationRouteResult {
  if (!navigation) {
    return { success: false, error: 'Navigation not available' };
  }

  const resolved = resolveNotificationAction(action, featureAccess, motivationStyle);
  return navigateFromSafeIntent(navigation, resolved.intent, resolved.params ?? action.payload, featureAccess);
}

export { deepLinkToNotificationAction } from './notification-deep-link';

const validTypes: NotificationActionType[] = [
  'start_session', 'view_boss', 'open_chest', 'view_squad', 'join_duel',
  'view_streak', 'open_shop', 'view_profile', 'open_coach', 'accept_invite',
  'view_progress', 'custom',
];

export function isValidNotificationAction(action: unknown): action is NotificationAction {
  if (!action || typeof action !== 'object' || !('type' in action)) return false;
  const type = Reflect.get(action, 'type');
  return validTypes.some((validType) => validType === type);
}

function navigateToSessionSetup(
  navigation: NotificationNavigation,
  payload?: Record<string, unknown>,
): NotificationRouteResult {
  const params: SessionStackParams['SessionSetup'] = {
    presetId: toOptionalString(payload?.presetId),
    comebackMultiplier: toOptionalNumber(payload?.comebackMultiplier),
    presetMode: payload?.presetMode === 'STUDY' ? 'STUDY' : undefined,
    source: payload?.source === 'content-study' ? 'content-study' : undefined,
  };
  navigation.navigate('SessionStack', { screen: 'SessionSetup', params });
  return { success: true, screen: 'SessionSetup' };
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}
