import {
  buildFeatureAccess,
  getFeatureAvailability,
  type FeatureKey,
  type FeatureAccessMap,
} from "../feature-access";
import { buildHomeFeatureRuntime } from "../../../screens/home/hooks/home-feature-runtime";
import { routeNotificationAction } from "../../../navigation/notification-routing-core";
import { FEATURE_ROUTE_REGISTRY } from "../../../navigation/feature-route-registry";

export function featuresAt(
  sessions: number,
  degradedKeys?: FeatureKey[],
): FeatureAccessMap {
  const degraded = new Set(degradedKeys ?? []);
  return buildFeatureAccess({
    totalCompletedSessions: sessions,
    degradedFeatures: degraded,
  }).features;
}

export const ALL_HIDDEN_FINAL_RELEASE: FeatureKey[] = [
  "battle_pass",
  "squads",
  "shop",
  "inventory",
  "social_tab",
  "rivals",
  "rankings",
  "wagers",
  "streak_insurance",
  "gems_prominent",
  "boss_bounties",
  "economy_advanced",
  "economy_basic",
];

export const HIDDEN_BOOT_FEATURES: FeatureKey[] = [
  "battle_pass",
  "squads",
  "shop",
  "inventory",
  "rivals",
  "rankings",
  "wagers",
  "economy_advanced",
  "economy_basic",
  "social_tab",
];

export {
  buildHomeFeatureRuntime,
  getFeatureAvailability,
  routeNotificationAction,
  FEATURE_ROUTE_REGISTRY,
};
