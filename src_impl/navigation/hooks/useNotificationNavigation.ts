import { useEffect } from 'react';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import { addBreadcrumb } from '../../config/sentry';
import { eventBus } from '../../events';
import { trackNotificationOpened } from '../../features/notifications/analytics';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access';
import { getFeatureAvailability } from '../../features/liveops-config/feature-availability';
import { routeNotificationAction } from '../notification-routing-core';
import type { NotificationAction } from '../notification-routing-types';

import type { ExtendedRootStackParams } from '../types';

interface UseNotificationNavigationInput {
  featureAccess?: FeatureAccessMap | null;
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

function notificationTypeToAction(type: string, data: Record<string, unknown>): NotificationAction {
  switch (type) {
    case 'boss_timeout_warning':
    case 'boss_encounter':
    case 'boss_defeated':
      return { type: 'view_boss' };
    case 'squad_war_start':
    case 'squad_war_end':
    case 'squad_war_reminder':
      return { type: 'view_squad' };
    case 'mastery_rank_up':
      return { type: 'custom', payload: { screen: 'Mastery' } };
    default:
      return { type: 'custom', payload: { screen: 'Home' } };
  }
}

function navigateFromNotification(
  type: string,
  navigationRef: NavigationContainerRefWithCurrent<ExtendedRootStackParams>,
  featureAccess?: FeatureAccessMap | null,
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
    case 'boss_timeout_warning': {
      if (featureAccess?.boss_tab) {
        const avail = getFeatureAvailability(featureAccess.boss_tab);
        if (!avail.canNavigate) { navigationRef.navigate('Main', { screen: 'Home' }); return; }
      }
      navigationRef.navigate('Guild');
      return;
    }
    case 'welcome_back':
    case 'comeback':
    case 'RETENTION_RE_ENGAGEMENT':
      navigationRef.navigate('Main', { screen: 'Home' });
      return;
    case 'boss_encounter':
    case 'boss_defeated': {
      if (featureAccess?.boss_tab) {
        const avail = getFeatureAvailability(featureAccess.boss_tab);
        if (!avail.canNavigate) { navigationRef.navigate('Main', { screen: 'Home' }); return; }
      }
      navigationRef.navigate('Boss');
      return;
    }
    case 'rival_challenge':
    case 'rival_defeated':
    case 'rival_activity':
      navigationRef.navigate('Main', { screen: 'Home' });
      return;
    case 'squad_war_start':
    case 'squad_war_end':
    case 'squad_war_reminder': {
      if (featureAccess?.squads) {
        const avail = getFeatureAvailability(featureAccess.squads);
        if (!avail.canNavigate) { navigationRef.navigate('Main', { screen: 'Home' }); return; }
      }
      navigationRef.navigate('Guild');
      return;
    }
    case 'achievement_unlocked':
    case 'achievement_milestone':
      navigationRef.navigate('Main', { screen: 'Profile', params: { tab: 'achievements' } });
      return;
    case 'streak_risk':
    case 'streak_at_risk':
      navigationRef.navigate('Main', { screen: 'Home' });
      eventBus.publish('streak:show_risk_banner', { priority: 'high' });
      return;
    case 'mastery_rank_up': {
      if (featureAccess?.achievements) {
        const avail = getFeatureAvailability(featureAccess.achievements);
        if (!avail.canNavigate) { navigationRef.navigate('Main', { screen: 'Home' }); return; }
      }
      navigationRef.navigate('Mastery');
      return;
    }
    default:
      navigationRef.navigate('Main', { screen: 'Home' });
  }
}

export function useNotificationNavigation({
  featureAccess,
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

        navigateFromNotification(type, navigationRef, featureAccess);
      });

      return () => subscription.remove();
    } catch (error) {
      addBreadcrumb('Notification response listener unavailable', 'notifications.expo_go', {
        reason: getErrorMessage(error),
      });
      return undefined;
    }
  }, [featureAccess, isAuthenticated, navigationRef, userId]);

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
