import { z } from 'zod';

import { eventBus } from '../../events';
import { calculateBossDamage } from '../../session/integration/SessionBossIntegration';
import { SessionSummarySchema } from '../../session/types';
import { createDebugger } from '../../utils/debug';
import { recordWeeklyQuestSessionSafely } from './service';

const debug = createDebugger('weekly-quests:integration');

const SessionCompletedEventSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  summary: SessionSummarySchema,
});

let initialized = false;

export function initializeWeeklyQuestIntegration(): () => void {
  if (initialized) {
    return () => undefined;
  }
  initialized = true;
  return eventBus.subscribe('session:completed', (rawEvent) => {
    const parsed = SessionCompletedEventSchema.safeParse(rawEvent);
    if (!parsed.success) {
      debug.warn('Skipping weekly quest progress because payload was invalid');
      return;
    }
    const { userId, summary } = parsed.data;
    void recordWeeklyQuestSessionSafely({
      userId,
      completedAt: summary.createdAt ?? Date.now(),
      sessionMode: summary.sessionMode ?? null,
      finalScore: summary.finalScore,
      bossDamage: calculateBossDamage(summary),
      streakDays: summary.streakDays,
      usedSessionItem: summary.bonuses.some((bonus) => bonus.type === 'ITEM'),
      bossDefeated: summary.bonuses.some((bonus) => bonus.type === 'BOSS_DEFEAT'),
    });
  });
}
