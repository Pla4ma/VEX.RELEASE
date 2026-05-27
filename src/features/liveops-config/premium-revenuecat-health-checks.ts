import {
  getCustomerInfo,
  getOfferings,
  initializeRevenueCat,
  isRevenueCatReady,
} from "../../shared/monetization/revenuecat-service";
import type { FeatureHealthCheck, FeatureHealthStatus } from "./feature-health";

function hasRevenueCatKey(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ||
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  );
}

async function ensureRevenueCatReady(): Promise<boolean> {
  if (!hasRevenueCatKey()) {
    return false;
  }
  if (isRevenueCatReady()) {
    return true;
  }
  const result = await initializeRevenueCat();
  return result.status === "ready";
}

async function checkRevenueCatConfig(): Promise<FeatureHealthStatus> {
  return (await ensureRevenueCatReady()) ? "healthy" : "unavailable";
}

async function checkRevenueCatOfferings(): Promise<FeatureHealthStatus> {
  if (!(await ensureRevenueCatReady())) {
    return "unavailable";
  }
  const result = await getOfferings();
  const packages = result.currentOffering?.availablePackages ?? [];
  return result.success && packages.length > 0 ? "healthy" : "unavailable";
}

async function checkRevenueCatEntitlements(): Promise<FeatureHealthStatus> {
  if (!(await ensureRevenueCatReady())) {
    return "unavailable";
  }
  const result = await getCustomerInfo();
  return result.success ? "healthy" : "unavailable";
}

export const premiumRevenueCatHealthChecks: FeatureHealthCheck[] = [
  {
    id: "premium_paywall_revenuecat_config",
    feature: "premium_paywall",
    label: "Premium Paywall - RevenueCat SDK ready",
    dependency: "revenuecat",
    cacheMs: 120_000,
    check: checkRevenueCatConfig,
  },
  {
    id: "premium_paywall_offerings",
    feature: "premium_paywall",
    label: "Premium Paywall - RevenueCat offerings load real packages",
    dependency: "revenuecat_offerings",
    cacheMs: 300_000,
    check: checkRevenueCatOfferings,
  },
  {
    id: "premium_paywall_entitlements",
    feature: "premium_paywall",
    label: "Premium Paywall - RevenueCat entitlements readable",
    dependency: "revenuecat_entitlements",
    cacheMs: 300_000,
    check: checkRevenueCatEntitlements,
  },
];
