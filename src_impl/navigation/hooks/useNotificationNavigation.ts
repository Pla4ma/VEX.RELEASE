import { useEffect } from 'react';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import { addBreadcrumb } from '../../config/sentry';
import { eventBus } from '../../events';
import { trackNotificationOpened } from '../../features/notifications/analytics';

import type { ExtendedRootStackParams } from '../types';

interface UseNotificationNavigationInput {
  isAuthenticated: boolean;
  navigationRef: NavigationContainerRefWithCurrent<ExtendedRootStackParams>;
  userId?: string;
}

function getNotificationType(data: Record<string, unknown>): string {
  return typeof data.type === 'string' ? data.type : 'unknown';
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function navigateFromNotification(
  type: string,
  navigationRef: NavigationContainerRefWithCurrent<ExtendedRootStackParams>,
): void {
  switch (type) {
    case 'streak_reminder':
    case 'session_prompt':
    case 'RETENTION_STREAK_PROTECTION':
      navigationRef.navigate('SessionStack', { screen: 'SessionSetup', params: {} });
      return;
    case 'challenge_reminder':
    case 'level_up':
    case 'RETENTION_CHALLENGE_EXPIRY':
      navigationRef.navigate('Main', { screen: 'Progress' });
      return;
    case 'boss_timeout_warning':
      navigationRef.navigate('Guild');
      return;
    case 'welcome_back':
    case 'comeback':
    case 'RETENTION_RE_ENGAGEMENT':
      navigationRef.navigate('Main', { screen: 'Home' });
      return;
    case 'boss_encounter':
    case 'boss_defeated':
      navigationRef.navigate('Boss');
      return;
    case 'rival_challenge':
    case 'rival_defeated':
    case 'rival_activity':
      navigationRef.navigate('Rivals');
      return;
    case 'squad_war_start':
    case 'squad_war_end':
    case 'squad_war_reminder':
      navigationRef.navigate('Guild');
      return;
    case 'achievement_unlocked':
    case 'achievement_milestone':
      navigationRef.navigate('Main', { screen: 'Profile', params: { tab: 'achievements' } });
      return;
    case 'streak_risk':
    case 'streak_at_risk':
      navigationRef.navigate('Main', { screen: 'Home' });
      eventBus.publish('streak:show_risk_banner', { priority: 'high' });
      return;
    case 'mastery_rank_up':
      navigationRef.navigate('Mastery');
      return;
    default:
      navigationRef.navigate('Main', { screen: 'Home' });
  }
}

export function useNotificationNavigation({
  isAuthenticated,
  navigationRef,
  userId,
}: UseNotificationNavigationInput): void {
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return undefined;
    }

    try {
      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<string, unknown>;
        const type = getNotificationType(data);
        const notificationId = response.notification.request.identifier;

        if (!navigationRef.isReady()) {
          return;
        }

        trackNotificationOpened(type, userId, notificationId);
        addBreadcrumb(`Navigating from notification: ${type}`, 'navigation.deep_link', {
          notificationType: type,
          notificationId,
          userId,
        });

        navigateFromNotification(type, navigationRef);
      });

      return () => subscription.remove();
    } catch (error) {
      addBreadcrumb('Notification response listener unavailable', 'notifications.expo_go', {
        reason: getErrorMessage(error),
      });
      return undefined;
    }
  }, [isAuthenticated, navigationRef, userId]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    try {
      const subscription = Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data as Record<string, unknown>;
        const type = getNotificationType(data);

        if (type === 'streak_reminder' || type === 'RETENTION_STREAK_PROTECTION') {
          eventBus.publish('notification:in_app_banner', {
            message: notification.request.content.body ?? 'Reminder',
            type: 'streak',
            data: { originalNotificationId: notification.request.identifier },
          });
        }

        if (type === 'session_prompt') {
          eventBus.publish('notification:in_app_banner', {
            message: notification.request.content.body ?? 'Time to focus!',
            type: 'session',
            data: { originalNotificationId: notification.request.identifier },
          });
        }
      });

      return () => subscription.remove();
    } catch (error) {
      addBreadcrumb('Foreground notification listener unavailable', 'notifications.expo_go', {
        reason: getErrorMessage(error),
      });
      return undefined;
    }
  }, [isAuthenticated]);
}
