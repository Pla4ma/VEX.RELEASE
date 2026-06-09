import {
  type Achievement,
  type UserAchievement,
  type AchievementCondition,
} from './types';
import { ALL_ACHIEVEMENTS } from './definitions';
import * as repository from './repository';
import { eventBus } from '../../events';
import { capture } from '../../shared/analytics/analytics-service';
import { ProgressionEvents } from '../../shared/analytics/analytics-events';

export async function updateAchievementProgress(
  userId: string,
  conditionType: string,
  value: number,
  _context?: Record<string, unknown>,
): Promise<UserAchievement[]> {
  const updatedAchievements: UserAchievement[] = [];
  const relevantAchievements = ALL_ACHIEVEMENTS.filter(
    (a) => a.unlockCondition.type === conditionType,
  );
  for (const achievement of relevantAchievements) {
    const userAchievement = await repository.getUserAchievement(
      userId,
      achievement.id,
    );
    if (userAchievement?.isUnlocked) {
      continue;
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
    if (updated) {
      updatedAchievements.push(updated);
      if (shouldUnlock && !userAchievement?.isUnlocked) {
        await handleAchievementUnlock(userId, achievement);
      }
    }
  }
  return updatedAchievements;
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

async function handleAchievementUnlock(
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

export function initializeAchievementTracking(): void {
  eventBus.subscribe('session:completed', async (event) => {
    const { userId, duration } = event;
    await updateAchievementProgress(userId, 'SESSION_COMPLETE', 1);
    await updateAchievementProgress(userId, 'FOCUS_MINUTES', duration);
  });
  eventBus.subscribe('streak:updated', async (event) => {
    const { userId, state } = event;
    await updateAchievementProgress(userId, 'STREAK_DAYS', state.currentStreak);
  });
  eventBus.subscribe('boss:defeated', async (event) => {
    const { userId, bossId } = event;
    await updateAchievementProgress(userId, 'BOSS_DEFEAT', 1);
    await updateAchievementProgress(userId, 'BOSS_DEFEAT_UNIQUE', 1, {
      bossId,
    });
  });
  eventBus.subscribe('duel:completed', async (event) => {
    const { winnerId, challengerId: _challengerId, challengedId: _challengedId } = event as {
      winnerId?: string;
      challengerId?: string;
      challengedId?: string;
    };
    if (winnerId) {
      await updateAchievementProgress(winnerId, 'DUEL_WIN', 1);
    }
  });
  eventBus.subscribe('squad:joined', async (event) => {
    const { userId } = event;
    await updateAchievementProgress(userId, 'SQUAD_JOIN', 1);
  });
  eventBus.subscribe('user:recruited', async (event) => {
    const { referrerId } = event;
    await updateAchievementProgress(referrerId, 'FRIEND_RECRUIT', 1);
  });
}
