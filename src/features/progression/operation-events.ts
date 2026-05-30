import { eventBus } from "../../events/EventBus";
import type { AddXpInput } from "./schemas";
import { calculateProgressPercent } from "./service-xp-calculations";
import type { AddXpOperationResult } from "./types";

export function publishProgressionEvents(
  skipEvents: boolean | undefined,
  userId: string,
  input: AddXpInput,
  breakdown: AddXpOperationResult["breakdown"],
  newTotalXp: number,
  newLevel: number,
  newXpInLevel: number,
  previousLevel: number,
  newThreshold: number,
  levelUpOccurred: boolean,
  rewards: string[],
): void {
  if (skipEvents) {
    return;
  }
  eventBus.publish("progression:xp_added", {
    userId,
    amount: breakdown.total,
    source: input.source,
    totalXP: newTotalXp,
    currentLevel: newLevel,
    progressPercent: calculateProgressPercent(newXpInLevel, newLevel),
    streakBonus: breakdown.momentumBonus,
    boostBonus: breakdown.recoveryBonus,
  });
  if (levelUpOccurred) {
    eventBus.publish("progression:level_up", {
      userId,
      newLevel,
      previousLevel,
      totalXP: newTotalXp,
      xpToNextLevel: newThreshold,
      prestige: 0,
      source: input.source,
      rewards,
    });
  }
}
