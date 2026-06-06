import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import { addBreadcrumb } from '../../config/sentry';
import { eventBus } from '../../events';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access';
import { routeNotificationAction } from '../notification-navigator';
import type { ExtendedRootStackParams } from '../types';
import {
  isHiddenV1Type,
  isNotificationTypeHiddenByV1FeatureMap,
} from './notification-type-guards';

export {
  HIDDEN_V1_NOTIFICATION_TYPES,
  HIDDEN_V1_TYPE_FALLBACK_ROUTES,
  isHiddenV1Type,
  isNotificationTypeHiddenByV1FeatureMap,
  getNotificationType,
  getErrorMessage,
  notificationTypeToAction,
} from './notification-type-guards';

export function navigateFromNotification(
  type: string,
  navigationRef: NavigationContainerRefWithCurrent<ExtendedRootStackParams>,
  featureAccess?: FeatureAccessMap | null,
  motivationStyle?: string | null,
): void {
  if (isHiddenV1Type(type) || isNotificationTypeHiddenByV1FeatureMap(type)) {
    addBreadcrumb(
      `Blocked hidden final-release notification type: ${type}`,
      'notifications.hidden_block',
      {
        notificationType: type,
      },
    );
    routeNotificationAction(
      navigationRef,
      { type: 'custom', payload: { screen: 'Home' } },
      featureAccess ?? undefined,
      motivationStyle,
    );
    return;
  }

  switch (type) {
    case 'streak_reminder':
    case 'session_prompt':
    case 'RETENTION_STREAK_PROTECTION':
      routeNotificationAction(
        navigationRef,
        { type: 'start_session' },
        featureAccess ?? undefined,
        motivationStyle,
      );
      return;
    case 'challenge_reminder':
    case 'level_up':
    case 'RETENTION_CHALLENGE_EXPIRY':
      routeNotificationAction(
        navigationRef,
        { type: 'view_progress' },
        featureAccess ?? undefined,
        motivationStyle,
      );
      return;
    case 'boss_timeout_warning':
      routeNotificationAction(
        navigationRef,
        { type: 'view_boss' },
        featureAccess ?? undefined,
        motivationStyle,
      );
      return;
    case 'welcome_back':
    case 'comeback':
    case 'RETENTION_RE_ENGAGEMENT':
      routeNotificationAction(
        navigationRef,
        { type: 'custom', payload: { screen: 'Home' } },
        featureAccess ?? undefined,
        motivationStyle,
      );
      return;
    case 'boss_encounter':
    case 'boss_defeated':
      routeNotificationAction(
        navigationRef,
        { type: 'view_boss' },
        featureAccess ?? undefined,
        motivationStyle,
      );
      return;
    case 'rival_challenge':
    case 'rival_defeated':
    case 'rival_activity':
      routeNotificationAction(
        navigationRef,
        { type: 'custom', payload: { screen: 'Home' } },
        featureAccess ?? undefined,
        motivationStyle,
      );
      return;
    case 'squad_war_start':
    case 'squad_war_end':
    case 'squad_war_reminder':
      routeNotificationAction(
        navigationRef,
        { type: 'view_squad' },
        featureAccess ?? undefined,
        motivationStyle,
      );
      return;
    case 'achievement_unlocked':
    case 'achievement_milestone':
      routeNotificationAction(
        navigationRef,
        { type: 'view_profile' },
        featureAccess ?? undefined,
        motivationStyle,
      );
      return;
    case 'streak_risk':
    case 'streak_at_risk':
      routeNotificationAction(
        navigationRef,
        { type: 'custom', payload: { screen: 'Home' } },
        featureAccess ?? undefined,
        motivationStyle,
      );
      eventBus.publish('streak:show_risk_banner', { priority: 'high' });
      return;
    case 'mastery_rank_up':
      routeNotificationAction(
        navigationRef,
        { type: 'custom', payload: { screen: 'Mastery' } },
        featureAccess ?? undefined,
        motivationStyle,
      );
      return;
    default:
      routeNotificationAction(
        navigationRef,
        { type: 'custom', payload: { screen: 'Home' } },
        featureAccess ?? undefined,
        motivationStyle,
      );
  }
}
