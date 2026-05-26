import { createDebugger } from '@/utils/debug';
import type { SessionSummary } from '@/session/types';
import type { BossEncounterSummary } from '@/features/boss/schemas';
import type { StreakEngineResult } from '@/features/streaks/schemas';
import { getStreakSummary } from '@/features/streaks/service';
import { getActiveEncounter } from '@/features/boss/service';
import { calculateBossDamage } from '@/session/integration/SessionBossIntegration';
import * as storyRepository from './repository';
import { StoryBeatTypeSchema, type SessionStory } from './schemas';
import type { StoryGeneratorContext } from './StoryGenerator';

const debug = createDebugger('session-story:engine');

/**
 * Initialize SessionStoryEngine — ARCHIVED: no event subscriptions.
 *
 * Previously subscribed to `session:completed` and auto-generated stories
 * on every completion. Now returns a no-op cleanup.
 *
 * Use `generateStoryForCompletedSession()` from StoryGenerator for explicit
 * manual invocation.
 */
export function initializeSessionStoryEngine(): () => void {
  debug.info('SessionStoryEngine archived — no subscriptions active');
  return () => {};
}

async function fetchBossContext(
  userId: string,
): Promise<StoryGeneratorContext['bossContext'] | null> {
  try {
    const encounter = await getActiveEncounter(userId);
    if (!encounter || encounter.status !== 'ACTIVE') {
      return null;
    }
    const damageDealt = calculateBossDamage(
      { effectiveDuration: 0, focusQuality: 0 } as SessionSummary,
      encounter.bossId,
    );
    return {
      encounter,
      damageDealt,
      defeated: encounter.healthRemaining <= 0,
    };
  } catch (error) {
    debug.warn('Failed to fetch boss context', error);
    return null;
  }
}

function calculateSessionsToNextTier(currentProgress: number): number {
  const progressPerSession = 3;
  const remainingProgress = 100 - currentProgress;
  return Math.max(1, Math.ceil(remainingProgress / progressPerSession));
}

interface BuildStoryContextResult extends StoryGeneratorContext {}

/**
 * Build read-only story context from completed session data.
 *
 * No mutations — reads streak snapshot from already-computed summary,
 * never calls recordSession, never touches XP/progression/rewards.
 */
export async function buildStoryContext(
  sessionId: string,
  userId: string,
  summary: SessionSummary,
): Promise<BuildStoryContextResult> {
  const bossContext = await fetchBossContext(userId);

  // Read-only streak snapshot — no mutation.
  // Session completion orchestrator already computed final streak state.
  const streakSummary = await getStreakSummary(userId).catch(() => null);

  const sessionsToNextTier = calculateSessionsToNextTier(0);

  return {
    sessionId,
    userId,
    sessionSummary: {
      actualDuration: summary.actualDuration,
      effectiveDuration: summary.effectiveDuration,
      focusQuality: summary.focusQuality ?? 0,
      focusPurityScore: summary.focusPurityScore,
      interruptions: summary.interruptions ?? 0,
      pauses: summary.pauses ?? 0,
      streakDays: summary.streakDays ?? 0,
      streakMaintained: summary.streakMaintained ?? true,
      sessionMode: summary.sessionMode ?? 'STANDARD',
      completionPercentage: summary.completionPercentage ?? 100,
      finalScore: summary.finalScore ?? 0,
    },
    bossContext: bossContext ?? undefined,
    streakResult: streakSummary
      ? {
          action: 'MAINTAINED' as StreakEngineResult['action'],
          previousStreak: Math.max(0, (streakSummary.currentDays ?? 0) - 1),
          newStreak: streakSummary.currentDays ?? 0,
          milestoneReached: null,
          shieldUsed: false,
        }
      : undefined,
    xpEarned: 0,
    currentLevel: 1,
    xpToNextLevel: 100,
    tierProgress: 0,
    sessionsToNextTier,
  };
}

export async function getStoryForSession(
  sessionId: string,
  userId: string,
): Promise<SessionStory | null> {
  return storyRepository.fetchStoryBySessionId(sessionId, userId);
}

export async function getStoriesForUser(
  userId: string,
  limit: number = 10,
): Promise<SessionStory[]> {
  return storyRepository.fetchStoriesForUser(userId, limit);
}

export async function markStoryBeatViewed(
  storyId: string,
  beatType: string,
  _userId: string,
): Promise<void> {
  const parsedBeatType = StoryBeatTypeSchema.safeParse(beatType);
  if (!parsedBeatType.success) {
    debug.warn('Invalid story beat viewed:', beatType);
    return;
  }
  debug.info('Story beat viewed: %s / %s', storyId, parsedBeatType.data);
}

export async function shareStory(
  storyId: string,
  _userId: string,
): Promise<void> {
  await storyRepository.markStoryShared(storyId);
}
