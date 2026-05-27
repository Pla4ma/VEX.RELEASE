import { Dimensions } from "react-native";

export const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const CARD_WIDTH = SCREEN_WIDTH * 0.7;

export interface SessionConsequenceCardsProps {
  bossConsequence?: {
    bossName: string;
    healthBefore: number;
    healthAfter: number;
    damageDealt: number;
    wasDefeated: boolean;
    hadCriticalHit: boolean;
    bountyConsumedCount?: number;
    bountyLootMultiplier?: number;
  } | null;

  streakConsequence?: {
    previousDays: number;
    currentDays: number;
    nextMilestone: number;
    daysUntilMilestone: number;
    streakSaved: boolean;
  } | null;

  challengeConsequence?: {
    challengeName: string;
    progressBefore: number;
    progressAfter: number;
    target: number;
    wasCompleted: boolean;
  } | null;

  rivalConsequence?: {
    rivalName: string;
    gapBefore: number;
    gapAfter: number;
    minutesGained: number;
  } | null;
}
