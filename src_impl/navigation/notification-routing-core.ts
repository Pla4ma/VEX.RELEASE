import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
  type FeatureAccessMap,
  type FeatureKey,
} from '../features/liveops-config';
import type { DeepLinkPath } from './deep-link-types';
import { getFeatureForRoute } from './feature-route-registry';
import type { SessionStackParams } from './types';
import type {
  NotificationAction,
  NotificationActionType,
  NotificationRouteResult,
  NotificationSafeIntent,
  SafeNotificationResolution,
} from './notification-routing-types';
import { isPublicV1Hidden } from '../features/liveops-config/public-v1-feature-map';

export type FeatureAccessCheck = Partial<FeatureAccessMap>;

interface NotificationNavigation {
  navigate(screen: string, params?: object | undefined): void;
}

const ALLOWED_MAIN_TAB_SCREENS = new Set(['Home', 'Progress', 'Profile']);
const ALLOWED_ROOT_SCREENS = new Set(['ContentStudy', 'AICoach', 'Mastery']);
const DISABLED_FILTER_TYPES: NotificationActionType[] = ['view_squad', 'join_duel', 'open_shop', 'open_chest', 'view_streak'];

function canUseFeature(
  featureAccess: FeatureAccessCheck | undefined,
  feature: FeatureKey | null,
): boolean {
  if (!feature) return true;
  const access = featureAccess?.[feature];
  return access ? isFeatureAvailableForNavigation(getFeatureAvailability(access)) : false;
}

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
      if (isPublicV1Hidden('boss_tab')) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Boss feature is not available in public v1' };
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
      if (isPublicV1Hidden('squads')) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Squads are not available in public v1' };
      }
      const squadsAvailable = canUseFeature(featureAccess, 'squads');
      if (!squadsAvailable) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Squads are not available yet' };
      }
      return { intent: 'OPEN_HOME', fallbackReason: 'Squad actions redirect to Home while social is limited' };
    }
    case 'open_shop': {
      if (isPublicV1Hidden('shop')) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Shop is not available in public v1' };
      }
      const shopAvailable = canUseFeature(featureAccess, 'shop');
      if (!shopAvailable) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Shop is not available' };
      }
      return { intent: 'OPEN_HOME', fallbackReason: 'Shop redirects to Home' };
    }
    case 'open_chest':
      if (isPublicV1Hidden('inventory')) {
        return { intent: 'OPEN_HOME', fallbackReason: 'Chests are not available in public v1' };
      }
      return { intent: 'OPEN_HOME', fallbackReason: 'Chest opening redirects to Home' };
    case 'custom': {
      const screen = toOptionalString(action.payload?.screen);
      if (!screen) return { intent: 'OPEN_HOME' };
      if (!ALLOWED_MAIN_TAB_SCREENS.has(screen) && !ALLOWED_ROOT_SCREENS.has(screen)) {
        return { intent: 'OPEN_HOME', fallbackReason: `Screen ${screen} is not whitelisted` };
      }
      if (!canUseFeature(featureAccess, getFeatureForRoute(screen))) {
        return { intent: 'OPEN_HOME', fallbackReason: `${screen} is not available yet` };
      }
      return { intent: 'OPEN_HOME', params: action.payload };
    }
    default:
      return { intent: 'OPEN_HOME' };
  }
}

/**
 * Returns the list of notification filter types that should be shown
 * given the current feature availability.
 */
export function getAvailableNotificationFilters(
  featureAccess?: FeatureAccessCheck,
): NotificationActionType[] {
  if (!featureAccess) {
    return ['start_session', 'view_progress', 'view_profile', 'custom'];
  }
  const filters: NotificationActionType[] = ['start_session', 'view_progress', 'view_profile'];
  if (canUseFeature(featureAccess, 'ai_coach_advanced') && !isPublicV1Hidden('ai_coach_advanced')) {
    filters.push('open_coach');
  }
  if (canUseFeature(featureAccess, 'boss_tab') && !isPublicV1Hidden('boss_tab')) {
    filters.push('view_boss');
  }
  return filters.concat('custom');
}

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

export function deepLinkToNotificationAction(
  path: DeepLinkPath,
  params: Record<string, string>,
): NotificationAction {
  switch (path) {
    case 'session':
      return { type: 'start_session', payload: { presetId: params.presetId } };
    case 'boss':
      return { type: 'view_boss' };
    case 'duels':
      return { type: 'join_duel', payload: { duelId: params.duelId } };
    case 'squad':
      return { type: 'view_squad', payload: { squadId: params.squadId } };
    case 'profile':
      return { type: 'view_profile', payload: { userId: params.userId } };
    case 'invite':
      return { type: 'accept_invite', payload: { inviteCode: params.code } };
    case 'study':
      return { type: 'start_session', payload: { presetMode: 'STUDY', source: 'content-study' } };
    case 'settings':
      return { type: 'view_progress' };
    case 'coach':
      return { type: 'open_coach' };
    case 'shop':
      return { type: 'open_shop' };
    default:
      return { type: 'custom', payload: { screen: path, params } };
  }
}

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
