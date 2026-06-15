import { eventBus } from '../../events/EventBus';
import { updateAchievementProgress } from './service';
import { updateBossDefeatUnique } from './boss-defeat-tracking';

export function initializeAchievementTracking(): () => void {
  const unsubs: Array<() => void> = [];
  unsubs.push(eventBus.subscribe('session:completed', async (event) => {
    const { userId, duration } = event;
    await updateAchievementProgress(userId, 'SESSION_COMPLETE', 1);
    await updateAchievementProgress(userId, 'FOCUS_MINUTES', duration);
  }));
  unsubs.push(eventBus.subscribe('streak:updated', async (event) => {
    const { userId, state } = event;
    await updateAchievementProgress(userId, 'STREAK_DAYS', state.currentStreak);
  }));
  unsubs.push(eventBus.subscribe('boss:defeated', async (event) => {
    const { userId, bossId } = event;
    await updateAchievementProgress(userId, 'BOSS_DEFEAT', 1);
    if (bossId) {
      await updateBossDefeatUnique(userId, bossId);
    }
  }));
  unsubs.push(eventBus.subscribe('duel:completed', async (event) => {
    const { winnerId, challengerId: _challengerId, challengedId: _challengedId } = event as {
      winnerId?: string;
      challengerId?: string;
      challengedId?: string;
    };
    if (winnerId) {
      await updateAchievementProgress(winnerId, 'DUEL_WIN', 1);
    }
  }));
  unsubs.push(eventBus.subscribe('squad:joined', async (event) => {
    const { userId } = event;
    await updateAchievementProgress(userId, 'SQUAD_JOIN', 1);
  }));
  unsubs.push(eventBus.subscribe('user:recruited', async (event) => {
    const { referrerId } = event;
    await updateAchievementProgress(referrerId, 'FRIEND_RECRUIT', 1);
  }));
  return () => { unsubs.forEach((unsub) => unsub()); };
}
