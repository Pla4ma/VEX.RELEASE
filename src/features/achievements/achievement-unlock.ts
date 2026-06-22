import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events/EventBus';
import { createDebugger } from '../../utils/debug';
import { getAchievementById } from './definitions';
import type { Achievement } from './types';
import * as achievementRepository from './repository';
import type { AchievementUnlockResult } from './event-handler-types';

const debug = createDebugger('achievements:unlock');

export async function checkAchievement(
  userId: string,
  achievementId: string,
): Promise<AchievementUnlockResult | null> {
  const achievement = getAchievementById(achievementId);
  if (!achievement) {
    debug.warn(
      `Achievement ${achievementId} not found`,
      new Error('Not found'),
    );
    return null;
  }
  const existing = await achievementRepository.getUserAchievement(
    userId,
    achievementId,
  );
  if (existing?.isUnlocked) {
    return null;
  }
  const result: AchievementUnlockResult = {
    achievementId,
    userId,
    unlockedAt: Date.now(),
    wasAlreadyUnlocked: false,
  };
  await unlockAchievement(userId, achievement);
  return result;
}

export async function checkCumulativeAchievements(
  userId: string,
  counterType: string,
  achievementIds: string[],
): Promise<void> {
  counterType;
  const achievements =
    await achievementRepository.getAllUserAchievements(userId);
  const toCheck = achievementIds
    .map((id) => getAchievementById(id))
    .filter((a): a is Achievement => a !== undefined)
    .filter((a) => {
      const progress =
        achievements.find((item) => item.achievementId === a.id)?.progress ?? 0;
      return progress >= a.progressMax;
    });
  await Promise.all(toCheck.map((a) => checkAchievement(userId, a.id)));
}

async function unlockAchievement(
  userId: string,
  achievement: Achievement,
): Promise<void> {
  const existing = await achievementRepository.getUserAchievement(
    userId,
    achievement.id,
  );
  if (existing) {
    await achievementRepository.updateAchievementProgress(
      userId,
      achievement.id,
      {
        progress: achievement.progressMax,
        isUnlocked: true,
        unlockedAt: Date.now(),
      },
    );
  } else {
    await achievementRepository.createUserAchievement(
      userId,
      achievement.id,
      {
        progress: achievement.progressMax,
        maxProgress: achievement.progressMax,
        isUnlocked: true,
      },
    );
  }
  Sentry.addBreadcrumb({
    category: 'achievements',
    message: `Achievement unlocked: ${achievement.title}`,
    level: 'info',
    data: {
      userId,
      achievementId: achievement.id,
      rarity: achievement.rarity,
    },
  });
  eventBus.publish('achievement:unlocked', {
    userId,
    achievementId: achievement.id,
    unlockedAt: Date.now(),
  });
}
