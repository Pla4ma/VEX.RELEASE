import {
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  type FeatureAccessMap,
  type FeatureKey,
} from "../features/liveops-config";

const PAYWALL_FEATURE_KEY: FeatureKey = "premium_paywall";

export function canRegisterPremiumPaywallRoute(
  features: FeatureAccessMap,
): boolean {
  const premiumFeature = features[PAYWALL_FEATURE_KEY];
  const premiumAvailability = premiumFeature
    ? getFeatureAvailabilityFor(PAYWALL_FEATURE_KEY, premiumFeature)
    : null;
  return (
    premiumAvailability !== null &&
    isFeatureAvailableForNavigation(premiumAvailability)
  );
}
