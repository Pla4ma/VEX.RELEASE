import type { Lane } from "../../features/lane-engine/types";

export type PremiumLane = "study" | "run" | "project" | "clean";

export interface LanePremiumHero {
  headline: string;
  body: string;
  benefits: readonly string[];
}

export const LANE_PREMIUM_HERO_COPY: Record<PremiumLane, LanePremiumHero> = {
  study: {
    headline: "Your Study Intelligence gets deeper",
    body: "Review plans, weak-topic focus, and smarter next blocks — built from your material.",
    benefits: [
      "Advanced import and material processing",
      "Review intelligence and spaced repetition",
      "Weak topic detection and exam prep planning",
    ],
  },
  run: {
    headline: "Your Run Intelligence gets sharper",
    body: "Personal boss insights, custom modifiers, and weekly run recaps — purely from your data.",
    benefits: [
      "Personal boss depth and behavior modifiers",
      "Weekly run recap with mastery insights",
      "No coins, gems, or shop power — pure performance intelligence",
    ],
  },
  project: {
    headline: "Your Project Memory keeps more context",
    body: "Longer memory, context restoration, and flow windows across project blocks.",
    benefits: [
      "Long project memory across sessions",
      "Context restoration and next-move detection",
      "Flow window intelligence for creative continuity",
    ],
  },
  clean: {
    headline: "Your Focus Intelligence works quietly",
    body: "Weekly patterns, best windows, and smarter planning without adding noise.",
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
