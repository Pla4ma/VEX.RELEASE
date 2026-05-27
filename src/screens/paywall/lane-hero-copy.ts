import type { Lane } from "../../features/lane-engine/types";

export type PremiumLane = "study" | "run" | "project" | "clean";

export interface LanePremiumHero {
  headline: string;
  body: string;
  benefits: readonly string[];
}

export const LANE_PREMIUM_HERO_COPY: Record<PremiumLane, LanePremiumHero> = {
  study: {
    headline: "Unlock deeper Study Intelligence",
    body: "Imports, review plans, weak topics, and exam prep.",
    benefits: [
      "Advanced import and material processing",
      "Review intelligence and spaced repetition",
      "Weak topic detection and exam prep planning",
    ],
  },
  run: {
    headline: "Unlock advanced Run Intelligence",
    body: "Personal bosses, modifiers, and weekly run recaps.",
    benefits: [
      "Personal boss depth and behavior modifiers",
      "Weekly run recap with mastery insights",
      "No coins, gems, or shop power — pure performance intelligence",
    ],
  },
  project: {
    headline: "Unlock Project Memory",
    body: "Context restore, next moves, and flow windows.",
    benefits: [
      "Long project memory across sessions",
      "Context restoration and next-move detection",
      "Flow window intelligence for creative continuity",
    ],
  },
  clean: {
    headline: "Unlock Focus Intelligence",
    body: "Quiet weekly reports, best windows, and smarter planning.",
    benefits: [
      "Weekly focus intelligence reports",
      "Calendar-aware planning windows",
      "Private memory console controls",
    ],
  },
};

export function mapLaneToPremiumLane(lane: Lane): PremiumLane {
  if (lane === "student") return "study";
  if (lane === "game_like") return "run";
  if (lane === "deep_creative") return "project";
  return "clean";
}
