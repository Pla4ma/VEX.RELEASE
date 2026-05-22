import type { NotificationAction, NotificationActionType } from '../../navigation/notification-routing-types';
import { launchColors } from '@theme/tokens/launch-colors';
import { isPublicV1Hidden } from '../../features/liveops-config/public-v1-feature-map';
import { getFeatureAvailability, isFeatureAvailableForNavigation } from '../../features/liveops-config/feature-availability';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access';
import type { NotificationCenterItem } from '../../features/notifications/service';

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
  ACHIEVEMENT: { icon: '\u{1F3C6}', color: launchColors.hex_eab308, bgColor: launchColors.hex_fef9c3 },
  STREAK_RISK: { icon: '\u{1F525}', color: launchColors.hex_ef4444, bgColor: launchColors.hex_fee2e2 },
  BOSS: { icon: '\u{1F480}', color: launchColors.hex_a855f7, bgColor: launchColors.hex_f3e8ff },
  SQUAD: { icon: '\u{1F6E1}', color: launchColors.hex_3b82f6, bgColor: launchColors.hex_dbeafe },
  RIVAL: { icon: '\u{2694}', color: launchColors.hex_ef4444, bgColor: launchColors.hex_fee2e2 },
  COACH: { icon: '\u{1F4AC}', color: launchColors.hex_22c55e, bgColor: launchColors.hex_dcfce7 },
  REWARD: { icon: '\u{1F381}', color: launchColors.hex_f59e0b, bgColor: launchColors.hex_fef3c7 },
  LEVEL_UP: { icon: '\u{2B50}', color: launchColors.hex_8b5cf6, bgColor: launchColors.hex_ede9fe },
};

export const NOTIFICATION_TYPE_TO_SAFE_ACTION: Record<NotificationType, NotificationActionType> = {
  ACHIEVEMENT: 'view_profile',
  STREAK_RISK: 'view_streak',
  BOSS: 'view_boss',
  SQUAD: 'view_squad',
  RIVAL: 'join_duel',
  COACH: 'open_coach',
  REWARD: 'view_progress',
  LEVEL_UP: 'view_progress',
};

const PUBLIC_V1_HIDDEN_NOTIFICATION_TYPES: NotificationType[] = ['SQUAD', 'RIVAL'];

export const FILTER_LABELS: Record<string, string> = {
  all: 'All',
  ACHIEVEMENT: 'Achievements',
  STREAK_RISK: 'Streaks',
  BOSS: 'Momentum',
  COACH: 'Coach',
  REWARD: 'Progress',
  LEVEL_UP: 'Levels',
};

export function groupNotificationsByTime(notifications: Notification[]): GroupedNotifications {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  return notifications.reduce(
    (groups, notification) => {
      const date = new Date(notification.timestamp);
      const notificationDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
    { today: [], yesterday: [], thisWeek: [], earlier: [] } as GroupedNotifications,
  );
}

export function isNotificationTypeFilterable(
  type: NotificationType,
  features: FeatureAccessMap,
): boolean {
  if (PUBLIC_V1_HIDDEN_NOTIFICATION_TYPES.includes(type)) return false;
  if (type === 'BOSS') {
    if (isPublicV1Hidden('boss_tab')) return false;
    const bossAvailability = getFeatureAvailability(features.boss_tab);
    return bossAvailability.canShowNotification || isFeatureAvailableForNavigation(bossAvailability);
  }
  if (type === 'COACH') {
    if (isPublicV1Hidden('ai_coach_advanced')) return false;
    const coachAvailability = getFeatureAvailability(features.ai_coach_advanced);
    return coachAvailability.canShowNotification || isFeatureAvailableForNavigation(coachAvailability);
  }
  return true;
}

export function mapToNotificationAction(notification: Notification): NotificationAction {
  const type = notification.type as NotificationType;
  const mappedType = NOTIFICATION_TYPE_TO_SAFE_ACTION[type] ?? 'view_progress';
  return {
    type: mappedType,
    payload: notification.actionParams as Record<string, unknown> | undefined,
  };
}
