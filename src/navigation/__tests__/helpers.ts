import {
  resolveNotificationAction,
  getAvailableNotificationFilters,
} from '../notification-routing-core';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access';
import { buildFeatureAccess } from '../../features/liveops-config/feature-access';

export function makeFeatureAccess(sessions: number): {
  features: FeatureAccessMap;
} {
  return buildFeatureAccess({ totalCompletedSessions: sessions });
}

export { resolveNotificationAction, getAvailableNotificationFilters };
