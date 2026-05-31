import type { Achievement } from '../../features/achievements/types';

export type ProfileAchievementStatus = Achievement & {
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: number;
  completionPercentage?: number;
};

export interface ProfileAchievementCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  statusLabel: 'Unlocked' | 'In Progress';
  statusTone: 'success' | 'secondary';
  progressLabel: string;
  accessibilityLabel: string;
}

const compareAchievements = (
  left: ProfileAchievementStatus,
  right: ProfileAchievementStatus,
): number => {
  if (left.isUnlocked !== right.isUnlocked) {
    return left.isUnlocked ? -1 : 1;
  }

  if (left.isUnlocked && right.isUnlocked) {
    return (right.unlockedAt ?? 0) - (left.unlockedAt ?? 0);
  }

  const progressDelta =
    (right.completionPercentage ?? 0) - (left.completionPercentage ?? 0);
  if (progressDelta !== 0) {
    return progressDelta;
  }

  return right.pointValue - left.pointValue;
};

export function buildProfileAchievementCards(
  achievements: ProfileAchievementStatus[] | null | undefined,
  limit = 3,
): ProfileAchievementCard[] {
  if (!achievements || achievements.length === 0) {
    return [];
  }

  return achievements
    .filter((achievement) => !achievement.isHidden || achievement.isUnlocked)
    .sort(compareAchievements)
    .slice(0, limit)
    .map((achievement) => {
      const statusLabel = achievement.isUnlocked ? 'Unlocked' : 'In Progress';
      const progressLabel = achievement.isUnlocked
        ? `${achievement.pointValue} pts earned`
        : `${achievement.progress} / ${achievement.progressMax}`;

      return {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        statusLabel,
        statusTone: achievement.isUnlocked ? 'success' : 'secondary',
        progressLabel,
        accessibilityLabel: achievement.isUnlocked
          ? `${achievement.title} achievement unlocked`
          : `${achievement.title} achievement in progress, ${progressLabel}`,
      };
    });
}
