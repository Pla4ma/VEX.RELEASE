import { z } from "zod";
import type { Lane } from "../lane-engine/types";

export interface LanePremiumCopy {
  headline: string;
  body: string;
  blockedTerms: readonly string[];
}

const BLOCKED_OLD_ECONOMY_TERMS = [
  "coins",
  "gems",
  "shop",
  "inventory",
  "premium chest",
  "paid streak save",
  "battle pass",
  "pay-to-win blocker",
  "fake AI memory",
] as const;

export const LANE_PREMIUM_COPY = {
  student: {
    headline: "Your Study Intelligence gets deeper",
    body: "VEX can turn your study rhythm into review plans, weak-topic focus, and smarter next blocks.",
  },
  game_like: {
    headline: "Your Run Intelligence gets sharper",
    body: "VEX can build personal blocker insights, custom modifiers, and weekly recaps from your run data.",
  },
  deep_creative: {
    headline: "Your Project Memory keeps more context",
    body: "VEX can preserve context, next moves, and flow windows across your project blocks.",
  },
  minimal_normal: {
    headline: "Your Focus Intelligence works quietly",
    body: "VEX can surface weekly patterns, best windows, and smarter planning without adding noise.",
  },
} as const;

export type PremiumLaneKey = keyof typeof LANE_PREMIUM_COPY;

export function getLanePremiumCopy(lane: PremiumLaneKey): LanePremiumCopy {
  return {
    headline: LANE_PREMIUM_COPY[lane].headline,
    body: LANE_PREMIUM_COPY[lane].body,
    blockedTerms: BLOCKED_OLD_ECONOMY_TERMS,
  };
}

export function mapLaneToPremiumKey(lane: Lane): PremiumLaneKey {
  return lane as PremiumLaneKey;
}
