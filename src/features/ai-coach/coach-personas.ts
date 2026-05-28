import { z } from "zod";
import type { MasteryRank } from "../progression/unified-mastery";
import { launchColors } from "@theme/tokens/launch-colors";

export const CoachPersonaSchema = z.enum([
  "SUPPORTIVE",
  "ANALYTICAL",
  "STRICT",
  "ZEN",
  "ENTHUSIASTIC",
  "DRILL_SERGEANT",
]);
export type CoachPersona = z.infer<typeof CoachPersonaSchema>;

export interface CoachPersonaConfig {
  id: CoachPersona;
  name: string;
  description: string;
  unlockRequirement: {
    type: "FREE" | "PREMIUM" | "MASTERY_RANK";
    value?: string;
  };
  messageStyle:
    | "gentle"
    | "direct"
    | "analytical"
    | "energetic"
    | "challenging";
  avatarUrl: string;
  colorTheme: string;
  freeFeatures: string[];
  premiumFeatures: string[];
}

export const COACH_PERSONAS: Record<CoachPersona, CoachPersonaConfig> = {
  SUPPORTIVE: {
    id: "SUPPORTIVE",
    name: "Alex",
    description: "Your encouraging companion for focus journey",
    unlockRequirement: { type: "FREE" },
    messageStyle: "gentle",
    avatarUrl: "coaches/supportive.png",
    colorTheme: launchColors.hex_4ecdc4,
    freeFeatures: [
      "Basic reminders",
      "Streak warnings",
      "Simple tips",
      "Session complete summary",
    ],
    premiumFeatures: ["Deep analytics", "Voice messages", "Custom schedules"],
  },
  ANALYTICAL: {
    id: "ANALYTICAL",
    name: "Sage",
    description: "Data-driven insights to optimize your focus",
    unlockRequirement: { type: "PREMIUM" },
    messageStyle: "analytical",
    avatarUrl: "coaches/analytical.png",
    colorTheme: launchColors.hex_4169e1,
    freeFeatures: [],
    premiumFeatures: [
      "Pattern analysis",
      "Predictive insights",
      "Optimal timing suggestions",
      "Performance breakdowns",
    ],
  },
  STRICT: {
    id: "STRICT",
    name: "Victor",
    description: "Tough love accountability partner",
    unlockRequirement: { type: "MASTERY_RANK", value: "ADEPT" },
    messageStyle: "challenging",
    avatarUrl: "coaches/strict.png",
    colorTheme: launchColors.hex_ff6b35,
    freeFeatures: [
      "Accountability checks",
      "Direct feedback",
      "Challenge prompts",
    ],
    premiumFeatures: ["Custom challenge creation", "Advanced accountability"],
  },
  ZEN: {
    id: "ZEN",
    name: "Mira",
    description: "Mindfulness and flow state guide",
    unlockRequirement: { type: "MASTERY_RANK", value: "EXPERT" },
    messageStyle: "gentle",
    avatarUrl: "coaches/zen.png",
    colorTheme: launchColors.hex_9b59b6,
    freeFeatures: [
      "Breathing exercises",
      "Mindfulness tips",
      "Flow state guidance",
    ],
    premiumFeatures: ["Meditation integration", "Advanced mindfulness"],
  },
  ENTHUSIASTIC: {
    id: "ENTHUSIASTIC",
    name: "Zoe",
    description: "High-energy motivation machine",
    unlockRequirement: { type: "MASTERY_RANK", value: "MASTER" },
    messageStyle: "energetic",
    avatarUrl: "coaches/enthusiastic.png",
    colorTheme: launchColors.hex_ffd700,
    freeFeatures: [
      "Motivation boosts",
      "Celebration messages",
      "Energy nudges",
    ],
    premiumFeatures: ["Personal hype videos", "Custom celebrations"],
  },
  DRILL_SERGEANT: {
    id: "DRILL_SERGEANT",
    name: "Sergeant Stone",
    description: "Ultimate discipline enforcer",
    unlockRequirement: { type: "MASTERY_RANK", value: "GRANDMASTER" },
    messageStyle: "challenging",
    avatarUrl: "coaches/drill.png",
    colorTheme: launchColors.hex_8b0000,
    freeFeatures: [
      "Discipline drills",
      "No-excuses mode",
      "Intensity protocols",
    ],
    premiumFeatures: ["Boot camp programs", "Extreme accountability"],
  },
};

export function getUnlockedPersonas(
  isPremium: boolean,
  masteryRank: MasteryRank,
): CoachPersona[] {
  const unlocked: CoachPersona[] = ["SUPPORTIVE"];
  if (isPremium) {
    unlocked.push("ANALYTICAL");
  }
  const rankOrder: MasteryRank[] = [
    "APPRENTICE",
    "ADEPT",
    "EXPERT",
    "MASTER",
    "GRANDMASTER",
  ];
  const userRankIndex = rankOrder.indexOf(masteryRank);
  if (userRankIndex >= 1) {
    unlocked.push("STRICT");
  }
  if (userRankIndex >= 2) {
    unlocked.push("ZEN");
  }
  if (userRankIndex >= 3) {
    unlocked.push("ENTHUSIASTIC");
  }
  if (userRankIndex >= 4) {
    unlocked.push("DRILL_SERGEANT");
  }
  return unlocked;
}
