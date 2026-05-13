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
// Notification routing result
// Notification action handler

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
  navigateToMainTab(navigation, 'Home');
  return { success: true, screen: 'Home' };
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

export * from "./notification-routing.types";
export * from "./notification-routing.part1";
