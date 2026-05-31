import type { FeatureKey } from '../../features/liveops-config/feature-access';
import { isFeatureHidden } from '../../features/liveops-config/final-release-feature-map';
import type { NotificationAction } from '../notification-routing-types';

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

export const HIDDEN_V1_TYPE_FALLBACK_ROUTES: Record<string, string> = {
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

export function isNotificationTypeHiddenByV1FeatureMap(
  notificationType: string,
): boolean {
  const key = HIDDEN_V1_FEATURE_KEYS.find((fk) => {
    return (
      notificationType.startsWith(fk.replace(/_/g, '_')) ||
      notificationType.includes(fk)
    );
  });
  if (!key) {return false;}
  return isFeatureHidden(key);
}

export function getNotificationType(data: Record<string, unknown>): string {
  return typeof data.type === 'string' ? data.type : 'unknown';
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function notificationTypeToAction(
  type: string,
  data: Record<string, unknown>,
): NotificationAction {
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
