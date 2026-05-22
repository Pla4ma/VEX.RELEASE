import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
} from '../features/liveops-config';
import type { FeatureAccessMap } from '../features/liveops-config/feature-access';
import { isPublicV1Hidden } from '../features/liveops-config/public-v1-feature-map';
import type { NotificationActionType } from './notification-routing-types';

export type FeatureAccessCheck = Partial<FeatureAccessMap>;

export function canUseFeature(
  featureAccess: FeatureAccessCheck | undefined,
  feature: import('../features/liveops-config').FeatureKey | null,
): boolean {
  if (!feature) return true;
  const access = featureAccess?.[feature];
  return access ? isFeatureAvailableForNavigation(getFeatureAvailability(access)) : false;
}

export function getAvailableNotificationFilters(
  featureAccess?: FeatureAccessCheck,
): NotificationActionType[] {
  if (!featureAccess) {
    return ['start_session', 'view_progress', 'view_profile', 'custom'];
  }
  const filters: NotificationActionType[] = ['start_session', 'view_progress', 'view_profile'];
  if (canUseFeature(featureAccess, 'ai_coach_advanced') && !isPublicV1Hidden('ai_coach_advanced')) {
    filters.push('open_coach');
  }
  if (canUseFeature(featureAccess, 'boss_tab') && !isPublicV1Hidden('boss_tab')) {
    filters.push('view_boss');
  }
  return filters.concat('custom');
}
