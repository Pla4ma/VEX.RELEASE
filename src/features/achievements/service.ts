import {
  type Achievement,
  type UserAchievement,
  type AchievementCondition,
} from './types';
import { ALL_ACHIEVEMENTS } from './definitions';
import * as repository from './repository';
import { eventBus } from '../../events/EventBus';
import { capture } from '../../shared/analytics/analytics-service';
import { ProgressionEvents } from '../../shared/analytics/analytics-events';
import { initializeAchievementTracking } from './achievement-tracking-init';

export { initializeAchievementTracking };

export async function updateAchievementProgress(
  userId: string,
  conditionType: string,
  value: number,
  context?: Record<string, unknown>,
): Promise<UserAchievement[]> {
  const relevantAchievements = ALL_ACHIEVEMENTS.filter(
    (a) => a.unlockCondition.type === conditionType,
  );
  const results = await Promise.all(
    relevantAchievements.map(async (achievement) => {
      const userAchievement = await repository.getUserAchievement(
        userId,
        achievement.id,
      );
      if (userAchievement?.isUnlocked) {
        return null;
      }
      const newProgress = calculateProgress(
        userAchievement?.progress || 0,
        value,
        achievement.unlockCondition,
      );
      const shouldUnlock = checkUnlockCondition(
        newProgress,
        achievement.progressMax,
        achievement.unlockCondition,
      );
      const updated = await repository.updateAchievementProgress(
        userId,
        achievement.id,
        {
          progress: newProgress,
          isUnlocked: shouldUnlock,
          unlockedAt: shouldUnlock ? Date.now() : undefined,
        },
      );
      if (updated && shouldUnlock && !userAchievement?.isUnlocked) {
        await handleAchievementUnlock(userId, achievement);
      }
      return updated;
    }),
  );
  return results.filter((r): r is UserAchievement => r !== null);
}

function checkUnlockCondition(
  progress: number,
  maxProgress: number,
  condition: AchievementCondition,
): boolean {
  switch (condition.comparator) {
    case 'EQUALS':
      return progress === condition.target;
    case 'GREATER_THAN':
      return progress >= condition.target;
    case 'LESS_THAN':
      return progress <= condition.target;
    case 'CUMULATIVE':
      return progress >= condition.target;
    default:
      return false;
  }
}

function calculateProgress(
  currentProgress: number,
  newValue: number,
  condition: AchievementCondition,
): number {
  switch (condition.comparator) {
    case 'CUMULATIVE':
      return currentProgress + newValue;
    case 'EQUALS':
    case 'GREATER_THAN':
      return Math.max(currentProgress, newValue);
    case 'LESS_THAN':
      return Math.min(currentProgress, newValue);
    default:
      return currentProgress;
  }
}

export async function handleAchievementUnlock(
  userId: string,
  achievement: Achievement,
): Promise<void> {
  eventBus.publish('achievement:unlocked', {
    userId,
    achievementId: achievement.id,
    unlockedAt: Date.now(),
  });
  await grantAchievementRewards(userId, achievement);
  capture(ProgressionEvents.ACHIEVEMENT_UNLOCKED, {
    user_id: userId,
    achievement_id: achievement.id,
    achievement_name: achievement.title,
    achievement_category: achievement.category,
    achievement_tier: achievement.rarity,
  });
}

async function grantAchievementRewards(
  userId: string,
  achievement: Achievement,
): Promise<void> {
  const { reward } = achievement;
  const coins = reward.coins ?? 0;
  if (coins > 0) {
    eventBus.publish('economy:add-currency', {
      userId,
      type: 'COINS',
      amount: coins,
      source: 'ACHIEVEMENT',
    });
  }
  const xp = reward.xp ?? 0;
  if (xp > 0) {
    eventBus.publish('progression:add-xp', {
      userId,
      amount: xp,
      source: 'ACHIEVEMENT',
    });
  }
  if (reward.badge) {
    eventBus.publish('rewards:badge-granted', {
      userId,
      badgeId: reward.badge,
    });
  }
  if (reward.title) {
    eventBus.publish('rewards:title-granted', {
      userId,
      titleId: reward.title,
    });
  }
  if (reward.cosmetic) {
    eventBus.publish('rewards:cosmetic-unlocked', {
      userId,
      cosmeticId: reward.cosmetic,
    });
  }
}
