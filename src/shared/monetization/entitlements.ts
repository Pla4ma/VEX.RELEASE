import { z } from "zod";

import type { EntitlementInfo } from "./revenuecat-types";

const PremiumEntitlementIdSchema = z.enum([
  "premium",
  "vex_premium",
  "premium_access",
  "vip",
  "vex_vip",
  "pro",
  "season_premium",
]);

export type PremiumEntitlementId = z.infer<typeof PremiumEntitlementIdSchema>;

export const KNOWN_PREMIUM_ENTITLEMENT_IDS: readonly PremiumEntitlementId[] =
  PremiumEntitlementIdSchema.options;

export interface EntitlementAccessState {
  isPremium: boolean;
  hasActiveEntitlements: boolean;
  premiumEntitlementIds: string[];
  unknownActiveEntitlementIds: string[];
  hasBillingIssue: boolean;
}

function normalizeEntitlementId(identifier: string): string {
  return identifier
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");
}

export function isPremiumEntitlementIdentifier(identifier: string): boolean {
  const normalized = normalizeEntitlementId(identifier);

  return (
    PremiumEntitlementIdSchema.safeParse(normalized).success ||
    normalized.startsWith("premium_") ||
    normalized.endsWith("_premium") ||
    normalized.startsWith("vex_premium") ||
    normalized.startsWith("vip_")
  );
}

export function getEntitlementAccessState(
  entitlements: readonly EntitlementInfo[],
): EntitlementAccessState {
  const active = entitlements.filter((entitlement) => entitlement.isActive);
  const premiumEntitlementIds = active
    .filter((entitlement) =>
      isPremiumEntitlementIdentifier(entitlement.identifier),
    )
    .map((entitlement) => entitlement.identifier);
  const unknownActiveEntitlementIds = active
    .filter(
      (entitlement) => !isPremiumEntitlementIdentifier(entitlement.identifier),
    )
    .map((entitlement) => entitlement.identifier);

  return {
    isPremium: premiumEntitlementIds.length > 0,
    hasActiveEntitlements: active.length > 0,
    premiumEntitlementIds,
    unknownActiveEntitlementIds,
    hasBillingIssue: active.some((entitlement) =>
      Boolean(entitlement.billingIssueDetectedAt),
    ),
  };
}

export function hasPremiumEntitlement(
  entitlements: readonly EntitlementInfo[],
): boolean {
  return getEntitlementAccessState(entitlements).isPremium;
}
