import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import { addBreadcrumb } from '../../config/sentry';
import { eventBus } from '../../events';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access';
import { routeNotificationAction } from '../notification-routing-core';
import type { NotificationAction } from '../notification-routing-types';
import type { ExtendedRootStackParams } from '../types';
import { isFeatureHidden } from '../../features/liveops-config/final-release-feature-map';
import type { FeatureKey } from '../../features/liveops-config/feature-access';

export const HIDDEN_V1_NOTIFICATION_TYPES = new Set([
  'squad_war_start',
  'squad_war_end',
  'squad_war_reminder',
  'rival_challenge',
  'rival_defeated',
  'rival_activity',
  'shop_new_items',
  'shop_sale',
  'inventory_update',
  'battle_pass_tier',
  'battle_pass_expiry',
  'wager_result',
  'guild_event',
]);

const HIDDEN_V1_TYPE_FALLBACK_ROUTES: Record<string, string> = {
  squad_war_start: 'Home',
  squad_war_end: 'Home',
  squad_war_reminder: 'Home',
  rival_challenge: 'Home',
  rival_defeated: 'Home',
  rival_activity: 'Home',
  shop_new_items: 'Home',
  shop_sale: 'Home',
  inventory_update: 'Home',
  battle_pass_tier: 'Home',
  battle_pass_expiry: 'Home',
  wager_result: 'Home',
  guild_event: 'Home',
};

export function isHiddenV1Type(notificationType: string): boolean {
  return HIDDEN_V1_NOTIFICATION_TYPES.has(notificationType);
}

const HIDDEN_V1_FEATURE_KEYS: FeatureKey[] = [
  'squads',
  'rivals',
  'shop',
  'inventory',
  'battle_pass',
  'wagers',
  'gems_prominent',
];

export function isNotificationTypeHiddenByV1FeatureMap(notificationType: string): boolean {
  const key = HIDDEN_V1_FEATURE_KEYS.find((fk) => {
    return notificationType.startsWith(fk.replace(/_/g, '_')) || notificationType.includes(fk);
  });
  if (!key) return false;
  return isFeatureHidden(key);
}

export function getNotificationType(data: Record<string, unknown>): string {
  return typeof data.type === 'string' ? data.type : 'unknown';
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function notificationTypeToAction(type: string, data: Record<string, unknown>): NotificationAction {
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

export function navigateFromNotification(
  type: string,
  navigationRef: NavigationContainerRefWithCurrent<ExtendedRootStackParams>,
  featureAccess?: FeatureAccessMap | null,
  motivationStyle?: string | null,
): void {
  if (isHiddenV1Type(type) || isNotificationTypeHiddenByV1FeatureMap(type)) {
    addBreadcrumb(`Blocked hidden final-release notification type: ${type}`, 'notifications.hidden_block', {
      notificationType: type,
    });
    routeNotificationAction(navigationRef, { type: 'custom', payload: { screen: 'Home' } }, featureAccess ?? undefined, motivationStyle);
    return;
  }

  switch (type) {
    case 'streak_reminder':
    case 'session_prompt':
    case 'RETENTION_STREAK_PROTECTION':
      routeNotificationAction(navigationRef, { type: 'start_session' }, featureAccess ?? undefined, motivationStyle);
      return;
    case 'challenge_reminder':
    case 'level_up':
    case 'RETENTION_CHALLENGE_EXPIRY':
      routeNotificationAction(navigationRef, { type: 'view_progress' }, featureAccess ?? undefined, motivationStyle);
      return;
    case 'boss_timeout_warning':
      routeNotificationAction(navigationRef, { type: 'view_boss' }, featureAccess ?? undefined, motivationStyle);
      return;
    case 'welcome_back':
    case 'comeback':
    case 'RETENTION_RE_ENGAGEMENT':
      routeNotificationAction(navigationRef, { type: 'custom', payload: { screen: 'Home' } }, featureAccess ?? undefined, motivationStyle);
      return;
    case 'boss_encounter':
    case 'boss_defeated':
      routeNotificationAction(navigationRef, { type: 'view_boss' }, featureAccess ?? undefined, motivationStyle);
      return;
    case 'rival_challenge':
    case 'rival_defeated':
    case 'rival_activity':
      routeNotificationAction(navigationRef, { type: 'custom', payload: { screen: 'Home' } }, featureAccess ?? undefined, motivationStyle);
      return;
    case 'squad_war_start':
    case 'squad_war_end':
    case 'squad_war_reminder':
      routeNotificationAction(navigationRef, { type: 'view_squad' }, featureAccess ?? undefined, motivationStyle);
      return;
    case 'achievement_unlocked':
    case 'achievement_milestone':
      routeNotificationAction(navigationRef, { type: 'view_profile' }, featureAccess ?? undefined, motivationStyle);
      return;
    case 'streak_risk':
    case 'streak_at_risk':
      routeNotificationAction(navigationRef, { type: 'custom', payload: { screen: 'Home' } }, featureAccess ?? undefined, motivationStyle);
      eventBus.publish('streak:show_risk_banner', { priority: 'high' });
      return;
    case 'mastery_rank_up':
      routeNotificationAction(navigationRef, { type: 'custom', payload: { screen: 'Mastery' } }, featureAccess ?? undefined, motivationStyle);
      return;
    default:
      routeNotificationAction(navigationRef, { type: 'custom', payload: { screen: 'Home' } }, featureAccess ?? undefined, motivationStyle);
  }
}
