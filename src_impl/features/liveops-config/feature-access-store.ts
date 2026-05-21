import type { FeatureAccessMap } from './feature-access';
import { getFeatureAvailability, type FeatureAvailability } from './feature-availability';
import type { FeatureKey } from './feature-access';

let _featureAccessMap: FeatureAccessMap | null = null;

export function setFeatureAccessMap(map: FeatureAccessMap): void {
  _featureAccessMap = map;
}

export function getFeatureAccessMap(): FeatureAccessMap | null {
  return _featureAccessMap;
}

export function getAvailabilityFor(key: FeatureKey): FeatureAvailability {
  const feature = _featureAccessMap?.[key];
  if (!feature) {
    return {
      state: 'disabled',
      canRenderEntryPoint: false,
      canNavigate: false,
      canQuery: false,
      canUseBackend: false,
      canRegisterRoute: false,
      canSubscribeToEvents: false,
      canShowNotification: false,
      reason: `Feature key "${key}" not found in access map`,
    };
  }
  return getFeatureAvailability(feature);
}
