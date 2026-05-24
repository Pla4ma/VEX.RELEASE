import type { FeatureAccessMap, FeatureKey } from './feature-access';
import { getFeatureAvailability, type FeatureAvailability } from './feature-availability';

let _featureAccessMap: FeatureAccessMap | null = null;

/** Centralized degraded features — written by useFeatureHealth, read by useFeatureAccess. */
let _degradedFeatures: Set<FeatureKey> = new Set();
const degradedFeatureListeners = new Set<() => void>();

export function setFeatureAccessMap(map: FeatureAccessMap): void {
  _featureAccessMap = map;
}

export function getFeatureAccessMap(): FeatureAccessMap | null {
  return _featureAccessMap;
}

export function setDegradedFeatures(features: Set<FeatureKey>): void {
  _degradedFeatures = features;
  for (const listener of degradedFeatureListeners) {
    listener();
  }
}

export function getDegradedFeatures(): Set<FeatureKey> {
  return _degradedFeatures;
}

export function subscribeToDegradedFeatures(listener: () => void): () => void {
  degradedFeatureListeners.add(listener);
  return () => {
    degradedFeatureListeners.delete(listener);
  };
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
