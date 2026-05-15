import type { NavigationProp } from '@react-navigation/native';

import {
  navigateToMainTab,
  navigateToSessionStackScreen,
  safeNavigate,
} from './navigation-helpers';
import type { DeepLinkPath } from './deep-link-types';
import type {
  MainStackParams,
  RootStackParams,
  SessionStackParams,
} from './types';
import type {
  NotificationAction,
  NotificationActionType,
  NotificationRouteResult,
} from './notification-routing-types';

export function routeNotificationAction(
  navigation: NavigationProp<RootStackParams> | null | undefined,
  action: NotificationAction,
): NotificationRouteResult {
  if (!navigation) {
    return { success: false, error: 'Navigation not available' };
  }

  switch (action.type) {
    case 'start_session':
      return navigateToSessionSetup(navigation, action.payload);
    case 'view_boss':
      navigateToMainRoot(navigation, 'Boss');
      return { success: true, screen: 'Boss' };
    case 'open_chest':
      navigateToMainTab(navigation, 'Profile');
      return { success: true, screen: 'Rewards' };
    case 'view_squad':
    case 'join_duel':
      navigateToMainTab(navigation, 'Home');
      return { success: true, screen: 'Home' };
    case 'view_streak':
      navigateToMainTab(navigation, 'Home');
      return { success: true, screen: 'Streak' };
    case 'open_shop':
      navigateToMainRoot(navigation, 'Shop');
      return { success: true, screen: 'Shop' };
    case 'view_profile':
      navigateToMainTab(navigation, 'Profile', {
        userId: toOptionalString(action.payload?.userId),
      });
      return { success: true, screen: 'Profile' };
    case 'open_coach':
      navigateToMainRoot(navigation, 'AICoach');
      return { success: true, screen: 'AICoach' };
    case 'accept_invite':
      navigateToMainTab(navigation, 'Profile', { tab: 'social' });
      return { success: true, screen: 'Invite', params: { tab: 'social' } };
    case 'view_progress':
      navigateToMainTab(navigation, 'Progress');
      return { success: true, screen: 'Progress' };
    case 'custom':
      return handleCustomAction(navigation, action.payload);
    default:
      return {
        success: false,
        error: `Unknown notification action type: ${String(action.type)}`,
      };
  }
}

function navigateToMainRoot(
  navigation: NavigationProp<RootStackParams>,
  route: keyof MainStackParams,
): void {
  navigation.navigate('Main', { screen: route });
}

function navigateToSessionSetup(
  navigation: NavigationProp<RootStackParams>,
  payload?: Record<string, unknown>,
): NotificationRouteResult {
  const params: SessionStackParams['SessionSetup'] = {
    presetId: toOptionalString(payload?.presetId),
    comebackMultiplier: toOptionalNumber(payload?.comebackMultiplier),
  };
  navigateToSessionStackScreen(navigation, 'SessionSetup', params);
  return { success: true, screen: 'SessionSetup' };
}

function handleCustomAction(
  navigation: NavigationProp<RootStackParams>,
  payload?: Record<string, unknown>,
): NotificationRouteResult {
  const screen = toOptionalString(payload?.screen);
  const params =
    payload?.params && typeof payload.params === 'object'
      ? (payload.params as Record<string, unknown>)
      : undefined;

  if (!screen) {
    return { success: false, error: 'Custom action missing screen' };
  }

  const didNavigate = safeNavigate(
    navigation as NavigationProp<Record<string, object | undefined>>,
    screen,
    params,
  );

  return didNavigate
    ? { success: true, screen, params }
    : { success: false, error: 'Navigation failed' };
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
      return {
        type: 'accept_invite',
        payload: { inviteCode: params.code, squadId: params.squadId },
      };
    case 'settings':
      return { type: 'view_progress' };
    case 'study':
    case 'coach':
      return { type: 'open_coach' };
    case 'shop':
      return { type: 'open_shop' };
    default:
      return { type: 'custom', payload: { screen: path, params } };
  }
}

const validTypes: NotificationActionType[] = [
  'start_session',
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

export function isValidNotificationAction(
  action: unknown,
): action is NotificationAction {
  if (!action || typeof action !== 'object' || !('type' in action)) {
    return false;
  }

  const type = (action as NotificationAction).type;
  return validTypes.includes(type);
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}
