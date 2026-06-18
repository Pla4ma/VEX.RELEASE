import {
  type NotificationAction,
  type NotificationRouteResult,
  type NotificationSafeIntent,
  type NotificationNavigation,
  validTypes,
  blocked,
  navigateToSessionSetup,
  navigateToRescueSession,
} from './notification-routing-types';
import { canUseFeature, type FeatureAccessCheck } from './notification-filters';
import { resolveNotificationAction } from './notification-resolver';
import {
  navigateToRootScreen,
  navigateToMainTab,
  navigateToMainStackScreen,
} from './navigation-helpers';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParams, MainStackParams } from './param-types';

export function navigateFromSafeIntent(
  navigation: NotificationNavigation,
  intent: NotificationSafeIntent,
  params?: Record<string, unknown>,
  featureAccess?: FeatureAccessCheck,
): NotificationRouteResult {
  switch (intent) {
    case 'START_SESSION':
      return navigateToSessionSetup(navigation, params);
    case 'START_RESCUE':
      return navigateToRescueSession(navigation, params);
    case 'OPEN_BOSS': {
      if (!canUseFeature(featureAccess, 'boss_tab')) {return blocked('Boss');}
      navigateToMainStackScreen(navigation as unknown as NavigationProp<MainStackParams>, 'Boss');
      return { success: true, screen: 'Boss' };
    }
    case 'OPEN_PROGRESS':
      navigateToMainTab(navigation as unknown as NavigationProp<RootStackParams>, 'Progress');
      return { success: true, screen: 'Progress' };
    case 'OPEN_PROFILE':
      navigateToMainTab(navigation as unknown as NavigationProp<RootStackParams>, 'Profile');
      return { success: true, screen: 'Profile' };
    case 'OPEN_COACH': {
      if (!canUseFeature(featureAccess, 'ai_coach_advanced'))
        {return blocked('AICoach');}
      navigateToMainStackScreen(navigation as unknown as NavigationProp<MainStackParams>, 'AICoach');
      return { success: true, screen: 'AICoach' };
    }
    case 'OPEN_STUDY_LAYER': {
      if (!canUseFeature(featureAccess, 'content_study'))
        {return blocked('ContentStudy');}
      navigateToMainStackScreen(navigation as unknown as NavigationProp<MainStackParams>, 'ContentStudy');
      return { success: true, screen: 'ContentStudy' };
    }
    case 'OPEN_SETTINGS':
      navigateToRootScreen(navigation as unknown as NavigationProp<RootStackParams>, 'Settings');
      return { success: true, screen: 'Settings' };
    case 'OPEN_HOME':
    default:
      navigateToMainTab(navigation as unknown as NavigationProp<RootStackParams>, 'Home');
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

  const resolved = resolveNotificationAction(
    action,
    featureAccess,
    motivationStyle,
  );
  return navigateFromSafeIntent(
    navigation,
    resolved.intent,
    resolved.params ?? action.payload,
    featureAccess,
  );
}

export function isValidNotificationAction(
  action: unknown,
): action is NotificationAction {
  if (!action || typeof action !== 'object' || !('type' in action))
    {return false;}
  const type = Reflect.get(action, 'type');
  return validTypes.some((validType) => validType === type);
}
