import type { SessionSummary } from '../../../session/types';
import type { CompanionState } from '../../../features/companion/types';
import type { CompanionService } from '../../../features/companion/service';
import {
  getEvolutionProgress,
  getMoodForSessionSummary,
  saveCompanionGrowth,
  saveCompanionState,
} from '../../../features/companion/session-storage';

export async function completeCompanionSessionImpl(
  service: CompanionService | null,
  state: CompanionState | null,
  userId: string | undefined,
  sessionId: string,
  summary: SessionSummary,
): Promise<CompanionState | null> {
  if (!service || !state || !userId) {
    return null;
  }
  const previousLevel = state.level;
  const minutes = Math.max(0, summary.effectiveDuration / 60000);
  const mood = getMoodForSessionSummary(summary);
  const outcome = service.completeSession(
    minutes,
    summary.focusPurityScore ?? summary.focusQuality ?? 0,
  );
  const nextState = service.getState();
  if (!nextState) {
    return null;
  }
  const saved = await saveCompanionState({
    ...nextState,
    currentMood: mood,
  });
  await saveCompanionGrowth(userId, {
    sessionId,
    mood,
    level: saved.level,
    phase: saved.phase,
    progressToEvolution: getEvolutionProgress(saved),
    totalFocusMinutes: saved.totalFocusMinutes,
    leveledUp: outcome.evolved || saved.level > previousLevel,
    evolved: outcome.evolved,
    updatedAt: Date.now(),
  });
  return saved;
}
