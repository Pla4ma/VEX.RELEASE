import { useEffect } from 'react';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import { addBreadcrumb } from '../../config/sentry';
import { eventBus } from '../../events/EventBus';
import { trackNotificationOpened } from '../../features/notifications/analytics';
import { useOnboardingStore } from '../../features/onboarding/store';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access';

import type { ExtendedRootStackParams } from '../types';

import {
  getNotificationType,
  getErrorMessage,
  navigateFromNotification,
} from './useNotificationNavigationHandlers';

interface UseNotificationNavigationInput {
  featureAccess?: FeatureAccessMap | null;
  isAuthenticated: boolean;
  navigationRef: NavigationContainerRefWithCurrent<ExtendedRootStackParams>;
  userId?: string;
}

export function useNotificationNavigation({
  featureAccess,
  isAuthenticated,
  navigationRef,
  userId,
}: UseNotificationNavigationInput): void {
  const motivationStyle = useOnboardingStore(
    (state) => state.explicitMotivationStyle,
  );

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return undefined;
    }

    try {
      const subscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as Record<
            string,
            unknown
          >;
          const type = getNotificationType(data);
          const notificationId = response.notification.request.identifier;

          if (!navigationRef.isReady()) {
            return;
          }

          trackNotificationOpened(type, userId, notificationId);
          addBreadcrumb(
            `Navigating from notification: ${type}`,
            'navigation.deep_link',
            {
              notificationType: type,
              notificationId,
              userId,
            },
          );

          navigateFromNotification(
            type,
            navigationRef,
            featureAccess,
            motivationStyle,
          );
        });

      return () => subscription.remove();
    } catch (error) {
      addBreadcrumb(
        'Notification response listener unavailable',
        'notifications.expo_go',
        {
          reason: getErrorMessage(error),
        },
      );
      return undefined;
    }
  }, [featureAccess, isAuthenticated, navigationRef, userId, motivationStyle]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    try {
      const subscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          const data = notification.request.content.data as Record<
            string,
            unknown
          >;
          const type = getNotificationType(data);

          if (
            type === 'streak_reminder' ||
            type === 'RETENTION_STREAK_PROTECTION'
          ) {
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
        },
      );

      return () => subscription.remove();
    } catch (error) {
      addBreadcrumb(
        'Foreground notification listener unavailable',
        'notifications.expo_go',
        {
          reason: getErrorMessage(error),
        },
      );
      return undefined;
    }
  }, [isAuthenticated]);
}
