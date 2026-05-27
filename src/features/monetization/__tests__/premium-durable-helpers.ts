import { resolvePremiumStrategy } from "../../../../shared/monetization/premium-strategy";
import {
  resolvePremiumTiming,
  PREMIUM_VALUE_MAP,
  getLanePremiumValue,
  mapProfileToLane,
} from "../premium-timing";
import { resolvePersonalizedPremium } from "../personalized-premium";
import { getPaywallTiming } from "../value-ladder";
import {
  VALUE_PROPOSITION,
  FREE_BOUNDARY_COPY,
  PREMIUM_BOUNDARY_COPY,
  FEATURE_HIGHLIGHT_MAP,
} from "../../../paywall/paywall-copy";

export {
  resolvePremiumStrategy,
  resolvePremiumTiming,
  PREMIUM_VALUE_MAP,
  getLanePremiumValue,
  mapProfileToLane,
  resolvePersonalizedPremium,
  getPaywallTiming,
  VALUE_PROPOSITION,
  FREE_BOUNDARY_COPY,
  PREMIUM_BOUNDARY_COPY,
  FEATURE_HIGHLIGHT_MAP,
};

export const blockedEconomyTerms = [
  "coin",
  "coins",
  "gem",
  "gems",
  "shop",
  "inventory",
  "chest",
  "chests",
  "loot",
  "lootbox",
  "battle pass",
  "streak insurance",
  "streak save",
  "paid save",
  "pay to win",
  "pay-to-win",
  "xp boost",
  "reward boost",
  "season rewards",
  "premium rewards",
];
