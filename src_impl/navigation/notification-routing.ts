/**
 * Notification Routing Service
 *
 * Handles navigation from notification taps with type safety.
 */

import type { NavigationProp } from '@react-navigation/native';
import { createDebugger } from '../utils/debug';
import type { DeepLinkPath } from './deep-links';
import type { RootStackParams, MainStackParams, MainTabParams } from './types';
import {
  navigateToSessionStackScreen,
  navigateToMainTab,
  navigateToMainStackScreen,
  safeNavigate,
} from './navigation-helpers';

const debug = createDebugger('navigation:notifications');

// Notification action types
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

// Notification routing result
export interface NotificationRouteResult {
  success: boolean;
  screen?: string;
  params?: Record<string, unknown>;
  error?: string;
}

// Notification action handler
export interface NotificationAction {
  type: NotificationActionType;
  payload?: Record<string, unknown>;
}

/**
 * Route notification action to navigation
 */
export function routeNotificationAction(
  navigation: NavigationProp<RootStackParams> | null | undefined,
  action: NotificationAction
): NotificationRouteResult {
  if (!navigation) {
    return { success: false, error: 'Navigation not available' };
  }

  try {
    switch (action.type) {
      case 'start_session':
        return navigateToSessionSetup(navigation, action.payload);

      case 'view_boss':
        return navigateToBoss(navigation);

      case 'open_chest':
        return navigateToChest(navigation, action.payload);

      case 'view_squad':
        return navigateToSquad(navigation, action.payload);

      case 'join_duel':
        return navigateToDuels(navigation, action.payload);

      case 'view_streak':
        return navigateToStreak(navigation);

      case 'open_shop':
        return navigateToShop(navigation);

      case 'view_profile':
        return navigateToProfile(navigation, action.payload);

      case 'open_coach':
        return navigateToCoach(navigation);

      case 'accept_invite':
        return navigateToInvite(navigation, action.payload);

      case 'view_progress':
        return navigateToProgress(navigation);

      case 'custom':
        return handleCustomAction(navigation, action.payload);

      default:
        return {
          success: false,
          error: `Unknown notification action type: ${action.type}`,
        };
    }
  } catch (error) {
    debug.error(
      'Failed to route notification action',
      error instanceof Error ? error : undefined
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Navigate to session setup
 */
function navigateToSessionSetup(
  navigation: NavigationProp<RootStackParams>,
  payload?: Record<string, unknown>
): NotificationRouteResult {
  const params: MainStackParams['SessionSetup'] = {
    presetId: payload?.presetId as string | undefined,
    comebackMultiplier: payload?.comebackMultiplier as number | undefined,
  };

  navigateToSessionStackScreen(navigation, 'SessionSetup', params);
  return { success: true, screen: 'SessionSetup' };
}

/**
 * Navigate to boss screen
 */
function navigateToBoss(navigation: NavigationProp<RootStackParams>): NotificationRouteResult {
  navigateToMainStackScreen(navigation as NavigationProp<MainStackParams>, 'Boss');
  return { success: true, screen: 'Boss' };
}

/**
 * Navigate to chest/rewards screen
 */
function navigateToChest(
  navigation: NavigationProp<RootStackParams>,
  _payload?: Record<string, unknown>
): NotificationRouteResult {
  // Navigate to profile tab where rewards/chests are shown
  navigateToMainTab(navigation, 'Profile');
  return { success: true, screen: 'Profile' };
}

/**
 * Navigate to squad screen
 */
function navigateToSquad(
  navigation: NavigationProp<RootStackParams>,
  _payload?: Record<string, unknown>
): NotificationRouteResult {
  navigateToMainStackScreen(navigation as NavigationProp<MainStackParams>, 'SquadWars');
  return { success: true, screen: 'SquadWars' };
}

/**
 * Navigate to duels screen
 */
function navigateToDuels(
  navigation: NavigationProp<RootStackParams>,
  _payload?: Record<string, unknown>
): NotificationRouteResult {
  navigateToMainStackScreen(navigation as NavigationProp<MainStackParams>, 'Duels');
  return { success: true, screen: 'Duels' };
}

/**
 * Navigate to streak screen (Home tab)
 */
function navigateToStreak(navigation: NavigationProp<RootStackParams>): NotificationRouteResult {
  navigateToMainTab(navigation, 'Home');
  return { success: true, screen: 'Home' };
}

/**
 * Navigate to shop
 */
function navigateToShop(navigation: NavigationProp<RootStackParams>): NotificationRouteResult {
  navigateToMainStackScreen(navigation as NavigationProp<MainStackParams>, 'Shop');
  return { success: true, screen: 'Shop' };
}

/**
 * Navigate to profile
 */
function navigateToProfile(
  navigation: NavigationProp<RootStackParams>,
  payload?: Record<string, unknown>
): NotificationRouteResult {
  const params: MainTabParams['Profile'] = {
    userId: payload?.userId as string | undefined,
  };
  navigateToMainTab(navigation, 'Profile', params);
  return { success: true, screen: 'Profile' };
}

/**
 * Navigate to AI coach
 */
function navigateToCoach(navigation: NavigationProp<RootStackParams>): NotificationRouteResult {
  navigateToMainStackScreen(navigation as NavigationProp<MainStackParams>, 'AICoach');
  return { success: true, screen: 'AICoach' };
}

/**
 * Navigate to invite acceptance
 * Social moved to Profile tab in launch structure
 */
function navigateToInvite(
  navigation: NavigationProp<RootStackParams>,
  _payload?: Record<string, unknown>
): NotificationRouteResult {
  navigateToMainTab(navigation, 'Profile');
  return { success: true, screen: 'Profile', params: { tab: 'social' } };
}

/**
 * Navigate to progress screen
 */
function navigateToProgress(navigation: NavigationProp<RootStackParams>): NotificationRouteResult {
  navigateToMainTab(navigation, 'Progress');
  return { success: true, screen: 'Progress' };
}

/**
 * Handle custom action with provided route
 */
function handleCustomAction(
  navigation: NavigationProp<RootStackParams>,
  payload?: Record<string, unknown>
): NotificationRouteResult {
  const screen = payload?.screen as string | undefined;
  const params = payload?.params as Record<string, unknown> | undefined;

  if (!screen) {
    return { success: false, error: 'Custom action missing screen' };
  }

  // Use safeNavigate for custom/untyped navigation
  safeNavigate(
    navigation as NavigationProp<Record<string, object | undefined>>,
    screen,
    params
  );

  return { success: true, screen, params };
}

/**
 * Create notification action from deep link
 */
export function deepLinkToNotificationAction(
  path: DeepLinkPath,
  params: Record<string, string>
): NotificationAction {
  switch (path) {
    case 'session':
      return {
        type: 'start_session',
        payload: { presetId: params.presetId },
      };

    case 'boss':
      return { type: 'view_boss' };

    case 'duels':
      return {
        type: 'join_duel',
        payload: { duelId: params.duelId },
      };

    case 'squad':
      return {
        type: 'view_squad',
        payload: { squadId: params.squadId },
      };

    case 'profile':
      return {
        type: 'view_profile',
        payload: { userId: params.userId },
      };

    case 'invite':
      return {
        type: 'accept_invite',
        payload: { inviteCode: params.code, squadId: params.squadId },
      };

    case 'settings':
      return { type: 'view_progress' };

    case 'study':
      return { type: 'open_coach' };

    case 'shop':
      return { type: 'open_shop' };

    case 'coach':
      return { type: 'open_coach' };

    default:
      return { type: 'custom', payload: { screen: path, params } };
  }
}

/**
 * Validate notification action
 */
export function isValidNotificationAction(
  action: unknown
): action is NotificationAction {
  if (!action || typeof action !== 'object') {
    return false;
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

  const actionType = (action as NotificationAction).type;
  return validTypes.includes(actionType);
}
