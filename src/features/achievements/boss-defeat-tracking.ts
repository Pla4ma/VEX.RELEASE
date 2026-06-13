import type { Achievement } from './types';
import { ALL_ACHIEVEMENTS } from './definitions';
import * as repository from './repository';

export async function updateBossDefeatUnique(
  userId: string,
  bossId: string,
): Promise<void> {
  const uniqueAchievement = ALL_ACHIEVEMENTS.find(
    (a) => a.unlockCondition.type === 'BOSS_DEFEAT_UNIQUE',
  );
  if (!uniqueAchievement) {return;}
  const existing = await repository.getUserAchievement(userId, uniqueAchievement.id);
  if (existing?.isUnlocked) {return;}
  const history = existing?.progressHistory ?? [];
  const alreadyDefeated = history.some(
    (h) => h.source === `boss:${bossId}`,
  );
  if (alreadyDefeated) {return;}
  const newProgress = history.length + 1;
  const shouldUnlock = newProgress >= uniqueAchievement.progressMax;
  await repository.updateAchievementProgress(userId, uniqueAchievement.id, {
    progress: newProgress,
    isUnlocked: shouldUnlock,
    unlockedAt: shouldUnlock ? Date.now() : undefined,
  });
  if (shouldUnlock && !existing?.isUnlocked) {
    const { handleAchievementUnlock } = await import('./service');
    await handleAchievementUnlock(userId, uniqueAchievement);
  }
}
