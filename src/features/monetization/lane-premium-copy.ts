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
  "pay-to-win boss",
  "fake AI memory",
] as const;

export const LANE_PREMIUM_COPY = {
  student: {
    headline: "Unlock deeper Study Intelligence",
    body: "Unlock deeper Study Intelligence: imports, review plans, weak topics, and exam prep.",
  },
  game_like: {
    headline: "Unlock advanced Run Intelligence",
    body: "Unlock advanced Run Intelligence: personal bosses, modifiers, and weekly run recaps.",
  },
  deep_creative: {
    headline: "Unlock Project Memory",
    body: "Unlock Project Memory: context restore, next moves, and flow windows.",
  },
  minimal_normal: {
    headline: "Unlock Focus Intelligence",
    body: "Unlock Focus Intelligence: quiet weekly reports, best windows, and smarter planning.",
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
