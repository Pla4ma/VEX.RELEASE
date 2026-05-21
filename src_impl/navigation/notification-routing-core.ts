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
} from './notification-routing-types';

export type FeatureAccessCheck = Partial<FeatureAccessMap>;

interface NotificationNavigation {
  navigate(screen: string, params?: object | undefined): void;
}

const CUSTOM_MAIN_TAB_SCREENS = new Set(['Home', 'Progress', 'Profile']);
const CUSTOM_ROOT_SCREENS = new Set(['ContentStudy', 'AICoach', 'Mastery']);

function canUseFeature(
  featureAccess: FeatureAccessCheck | undefined,
  feature: FeatureKey | null,
): boolean {
  if (!feature) {
    return true;
  }
  const access = featureAccess?.[feature];
  return access
    ? isFeatureAvailableForNavigation(getFeatureAvailability(access))
    : false;
}

function blocked(screen: string): NotificationRouteResult {
  return { success: false, error: `${screen} is not available yet`, screen: 'Home' };
}

export function routeNotificationAction(
  navigation: NotificationNavigation | null | undefined,
  action: NotificationAction,
  featureAccess?: FeatureAccessCheck,
): NotificationRouteResult {
  if (!navigation) {
    return { success: false, error: 'Navigation not available' };
  }

  switch (action.type) {
    case 'start_session':
      return navigateToSessionSetup(navigation, action.payload);
    case 'view_boss':
      return navigateFeatureRoot(navigation, 'Boss', 'boss_tab', featureAccess);
    case 'open_chest':
    case 'view_streak':
      navigation.navigate('Main', { screen: 'Profile' });
      return { success: true, screen: 'Profile' };
    case 'view_squad':
    case 'join_duel':
      navigation.navigate('Main', { screen: 'Home' });
      return { success: true, screen: 'Home' };
    case 'open_shop':
      return navigateFeatureRoot(navigation, 'Shop', 'shop', featureAccess);
    case 'view_profile':
      navigation.navigate('Main', {
        screen: 'Profile',
        params: { userId: toOptionalString(action.payload?.userId) },
      });
      return { success: true, screen: 'Profile' };
    case 'open_coach':
      return navigateFeatureRoot(navigation, 'AICoach', 'ai_coach_advanced', featureAccess);
    case 'accept_invite':
      navigation.navigate('Main', { screen: 'Profile' });
      return { success: true, screen: 'Profile' };
    case 'view_progress':
      navigation.navigate('Main', { screen: 'Progress' });
      return { success: true, screen: 'Progress' };
    case 'custom':
      return handleCustomAction(navigation, action.payload, featureAccess);
    default:
      return {
        success: false,
        error: `Unknown notification action type: ${String(Reflect.get(action, 'type'))}`,
      };
  }
}

function navigateFeatureRoot(
  navigation: NotificationNavigation,
  screen: string,
  feature: FeatureKey,
  featureAccess: FeatureAccessCheck | undefined,
): NotificationRouteResult {
  if (!canUseFeature(featureAccess, feature)) {
    return blocked(screen);
  }
  navigation.navigate(screen, undefined);
  return { success: true, screen };
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

function handleCustomAction(
  navigation: NotificationNavigation,
  payload?: Record<string, unknown>,
  featureAccess?: FeatureAccessCheck,
): NotificationRouteResult {
  const screen = toOptionalString(payload?.screen);
  if (!screen) {
    return { success: false, error: 'Custom action missing screen' };
  }
  if (!CUSTOM_MAIN_TAB_SCREENS.has(screen) && !CUSTOM_ROOT_SCREENS.has(screen)) {
    return { success: false, error: `Custom action screen not whitelisted: ${screen}` };
  }
  if (!canUseFeature(featureAccess, getFeatureForRoute(screen))) {
    return blocked(screen);
  }
  if (screen === 'Home' || screen === 'Progress' || screen === 'Profile') {
    navigation.navigate('Main', { screen });
    return { success: true, screen };
  }
  if (screen === 'ContentStudy' || screen === 'AICoach' || screen === 'Mastery') {
    navigation.navigate(screen, undefined);
    return { success: true, screen };
  }
  return { success: false, error: `Custom action screen not routable: ${screen}` };
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
  if (!action || typeof action !== 'object' || !('type' in action)) {
    return false;
  }
  const type = Reflect.get(action, 'type');
  return validTypes.some((validType) => validType === type);
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}
