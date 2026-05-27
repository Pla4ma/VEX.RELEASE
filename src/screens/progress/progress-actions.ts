import {
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
} from "../../features/liveops-config/feature-availability";
import type { FeatureAccess } from "../../features/liveops-config/feature-access";

export type MonthlyReportAction = "paywall" | "start-session";

export function resolveMonthlyReportAction(
  premiumPaywall: FeatureAccess,
): MonthlyReportAction {
  const availability = getFeatureAvailabilityFor(
    "premium_paywall",
    premiumPaywall,
  );
  return isFeatureAvailableForNavigation(availability)
    ? "paywall"
    : "start-session";
}
