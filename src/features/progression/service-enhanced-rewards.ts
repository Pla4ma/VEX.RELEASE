import { getProgressionServiceConfig } from "./service-enhanced-config";

export function getLevelUpRewards(newLevel: number): string[] {
  const rewards: string[] = [];
  const { prestigeEnabled } = getProgressionServiceConfig();

  if (newLevel % 5 === 0) {
    rewards.push(`LEVEL_${newLevel}_BUNDLE`);
  }
  if (newLevel === 10) {
    rewards.push("TITLE_ADEPT");
  }
  if (newLevel === 25) {
    rewards.push("TITLE_EXPERT");
  }
  if (newLevel === 50) {
    rewards.push("TITLE_MASTER");
  }
  if (newLevel === 100 && prestigeEnabled) {
    rewards.push("PRESTIGE_AVAILABLE");
  }

  return rewards;
}

function getCelebrationRewardForLevel(level: number): string[] {
  const rewards: string[] = [];
  if (level % 10 === 0) {
    rewards.push(`${level * 10} coin milestone reward`);
  }
  if (level === 10) {
    rewards.push("Adept tier reached");
  }
  if (level === 25) {
    rewards.push("Expert tier reached");
  }
  if (level === 50) {
    rewards.push("Master tier reached");
  }
  if (level === 100) {
    rewards.push("Centurion tier reached");
  }
  return rewards;
}

export function getLevelUpCelebrationRewards(
  oldLevel: number,
  newLevel: number,
): string[] {
  const rewards = Array.from(
    { length: Math.max(0, newLevel - oldLevel) },
    (_, index) => getCelebrationRewardForLevel(oldLevel + index + 1),
  ).flat();
  return rewards.length > 0 ? rewards : [`Level ${newLevel} reached`];
}
