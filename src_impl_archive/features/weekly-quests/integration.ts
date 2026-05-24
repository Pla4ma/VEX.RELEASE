import { z } from 'zod';

import { eventBus } from '../../events';
import { calculateBossDamage } from '../../session/integration/SessionBossIntegration';
import { SessionSummarySchema } from '../../session/types';
import { createDebugger } from '../../utils/debug';
import { getAvailabilityFor } from '../liveops-config/feature-access-store';
import { recordWeeklyQuestSessionSafely } from './service';

const debug = createDebugger('weekly-quests:integration');

const FEATURE_KEY = 'challenges' as const;

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

  const availability = getAvailabilityFor(FEATURE_KEY);
  if (!availability.canSubscribeToEvents) {
    debug.info('Weekly quest integration skipped — feature not available');
    return () => undefined;
  }

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
      finalScore: summary.finalScore ?? 0,
      bossDamage: calculateBossDamage(summary),
      streakDays: summary.streakDays ?? 0,
      usedSessionItem: summary.bonuses?.some((bonus) => bonus.type === 'ITEM') ?? false,
      bossDefeated: summary.bonuses?.some((bonus) => bonus.type === 'BOSS_DEFEAT') ?? false,
    });
  });
}
