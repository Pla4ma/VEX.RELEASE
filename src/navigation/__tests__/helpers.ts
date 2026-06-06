import { resolveNotificationAction } from '../notification-resolver';
import { getAvailableNotificationFilters } from '../notification-filters';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access';
import { buildFeatureAccess } from '../../features/liveops-config/feature-access';

export function makeFeatureAccess(sessions: number): {
  features: FeatureAccessMap;
} {
  return buildFeatureAccess({ totalCompletedSessions: sessions });
}

export { resolveNotificationAction, getAvailableNotificationFilters };
