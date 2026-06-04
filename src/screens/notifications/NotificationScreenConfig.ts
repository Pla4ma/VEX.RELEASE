import type {
  NotificationAction,
  NotificationActionType,
} from '../../navigation/notification-routing-types';

import { isFeatureHidden } from '../../features/liveops-config/final-release-feature-map';
import {
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
} from '../../features/liveops-config/feature-availability';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access';
import type { NotificationCenterItem } from '../../features/notifications/service';
import { lightColors } from '@/theme/tokens/colors';

export type NotificationType =
  | 'ACHIEVEMENT'
  | 'STREAK_RISK'
  | 'BOSS'
  | 'SQUAD'
  | 'RIVAL'
  | 'COACH'
  | 'REWARD'
  | 'LEVEL_UP';

export type Notification = NotificationCenterItem;

export type NotificationListItem = {
  type: 'header' | 'notification';
  data?: Notification;
  title?: string;
  count?: number;
};

export interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  earlier: Notification[];
}

export const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { icon: string; color: string; bgColor: string }
> = {
  ACHIEVEMENT: {
    icon: '\u{1F3C6}',
    color: lightColors.semantic.warning,
    bgColor: lightColors.warning[50],
  },
  STREAK_RISK: {
    icon: '\u{1F525}',
    color: lightColors.semantic.danger,
    bgColor: lightColors.error[50],
  },
  BOSS: {
    icon: '\u{1F480}',
    color: lightColors.accent.purple,
    bgColor: lightColors.primary[50],
  },
  SQUAD: {
    icon: '\u{1F6E1}',
    color: lightColors.accent.blue,
    bgColor: lightColors.info[50],
  },
  RIVAL: {
    icon: '\u{2694}',
    color: lightColors.semantic.danger,
    bgColor: lightColors.error[50],
  },
  COACH: {
    icon: '\u{1F4AC}',
    color: lightColors.semantic.success,
    bgColor: lightColors.success[50],
  },
  REWARD: {
    icon: '\u{1F381}',
    color: lightColors.semantic.warning,
    bgColor: lightColors.warning[50],
  },
  LEVEL_UP: {
    icon: '\u{2B50}',
    color: lightColors.accent.purple,
    bgColor: lightColors.primary[50],
  },
};

export const NOTIFICATION_TYPE_TO_SAFE_ACTION: Record<
  NotificationType,
  NotificationActionType
> = {
  ACHIEVEMENT: 'view_progress',
  STREAK_RISK: 'view_streak',
  BOSS: 'view_boss',
  SQUAD: 'view_squad',
  RIVAL: 'join_duel',
  COACH: 'open_coach',
  REWARD: 'view_progress',
  LEVEL_UP: 'view_progress',
};

const FINAL_RELEASE_HIDDEN_NOTIFICATION_TYPES: NotificationType[] = [
  'SQUAD',
  'RIVAL',
];

export const FILTER_LABELS: Record<string, string> = {
  all: 'All',
  ACHIEVEMENT: 'Achievements',
  STREAK_RISK: 'Streaks',
  BOSS: 'Momentum',
  COACH: 'Coach',
  REWARD: 'Progress',
  LEVEL_UP: 'Levels',
};

export function groupNotificationsByTime(
  notifications: Notification[],
): GroupedNotifications {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  return notifications.reduce(
    (groups, notification) => {
      const date = new Date(notification.timestamp);
      const notificationDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      if (notificationDay.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notificationDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notificationDay >= thisWeekStart) {
        groups.thisWeek.push(notification);
      } else {
        groups.earlier.push(notification);
      }
      return groups;
    },
    {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: [],
    } as GroupedNotifications,
  );
}

export function isNotificationTypeFilterable(
  type: NotificationType,
  features: FeatureAccessMap,
): boolean {
  if (FINAL_RELEASE_HIDDEN_NOTIFICATION_TYPES.includes(type)) {return false;}
  if (type === 'BOSS') {
    if (isFeatureHidden('boss_tab')) {return false;}
    const bossAvailability = getFeatureAvailabilityFor(
      'boss_tab',
      features.boss_tab,
    );
    return (
      bossAvailability.canShowNotification ||
      isFeatureAvailableForNavigation(bossAvailability)
    );
  }
  if (type === 'COACH') {
    if (isFeatureHidden('ai_coach_advanced')) {return false;}
    const coachAvailability = getFeatureAvailabilityFor(
      'ai_coach_advanced',
      features.ai_coach_advanced,
    );
    return (
      coachAvailability.canShowNotification ||
      isFeatureAvailableForNavigation(coachAvailability)
    );
  }
  return true;
}

export function mapToNotificationAction(
  notification: Notification,
): NotificationAction {
  const type = notification.type as NotificationType;
  const mappedType = NOTIFICATION_TYPE_TO_SAFE_ACTION[type] ?? 'view_progress';
  return {
    type: mappedType,
    payload: notification.actionParams,
  };
}
