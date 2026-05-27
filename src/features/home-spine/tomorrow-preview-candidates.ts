import type {
  ComputeTomorrowPreviewInput,
  TomorrowPreviewData,
} from "./tomorrow-preview-schemas";

const milestoneDays = [7, 14, 30, 60, 100, 180, 365];

function getMilestoneBadgeName(days: number): string {
  const badgeNames: Record<number, string> = {
    7: "Phoenix",
    14: "Griffin",
    30: "Dragon",
    60: "Titan",
    100: "Centurion",
    180: "Immortal",
    365: "Legend",
  };
  return badgeNames[days] ?? "Milestone";
}

export function buildStreakMilestoneCandidate(
  input: ComputeTomorrowPreviewInput,
): TomorrowPreviewData | null {
  const nextMilestone = milestoneDays.find(
    (day) => day > input.currentStreakDays,
  );
  if (
    !input.streakWillContinue ||
    nextMilestone !== input.currentStreakDays + 1
  ) {
    return null;
  }
  const badgeName = getMilestoneBadgeName(nextMilestone);
  return {
    actionPrompt: "Don't break the chain!",
    emoji: "🔥",
    headline: `${nextMilestone}-Day Streak!`,
    metadata: { badgeName, milestoneDays: nextMilestone },
    priority: 1,
    subtext: `Tomorrow: Day ${nextMilestone}. Claim your ${badgeName} badge.`,
    type: "STREAK_MILESTONE",
  };
}

export function buildBossCandidate(
  input: ComputeTomorrowPreviewInput,
): TomorrowPreviewData | null {
  const boss = input.bossData;
  if (!boss || boss.healthPercent >= 25) {
    return null;
  }
  return {
    actionPrompt: boss.canDefeatTomorrow
      ? "Prepare to strike!"
      : "Join the squad!",
    emoji: "boss",
    headline: boss.canDefeatTomorrow
      ? `${boss.bossName} Will Fall!`
      : "Boss Almost Defeated!",
    metadata: { bossName: boss.bossName, healthPercent: boss.healthPercent },
    priority: 2,
    subtext: boss.canDefeatTomorrow
      ? "One good session tomorrow defeats the boss!"
      : `${boss.bossName} at ${boss.healthPercent.toFixed(0)}% - squad needs your help!`,
    type: "BOSS_NEAR_DEATH",
  };
}

export function buildRivalCandidate(
  input: ComputeTomorrowPreviewInput,
): TomorrowPreviewData | null {
  const rival = input.rivalData;
  if (!rival || rival.gapMinutes <= 0) {
    return null;
  }
  const willOvertake =
    rival.myMinutes + Math.min(rival.gapMinutes, 30) > rival.theirMinutes;
  return {
    actionPrompt: "Show them who's boss!",
    emoji: "swords",
    headline: willOvertake ? "Overtake Your Rival!" : "Close the Gap!",
    metadata: { gapMinutes: rival.gapMinutes, rivalName: rival.rivalName },
    priority: 3,
    subtext: willOvertake
      ? `One session tomorrow puts you ahead of ${rival.rivalName}!`
      : `${rival.rivalName} is ${rival.gapMinutes} min ahead. Catch up tomorrow!`,
    type: "RIVAL_GAP",
  };
}
