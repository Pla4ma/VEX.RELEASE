import { captureSilentFailure } from '../../utils/silent-failure';
import { getSessionRepository } from '../../session/repository/SessionRepository';
import { getSessionService } from '../../session/SessionService';
import type { SessionHistoryEntry } from '../../session/types';
import type { z } from 'zod';
import type { GenerationRecord } from './session-analyzer-types';
import { SessionNotesSchema } from './session-analyzer-types';

// ─── Generation record stub ─────────────────────────────────────
const fetchGenerationRecord = async (
  _docId: string,
): Promise<GenerationRecord> => {
  return { lastStudiedAt: null, keyConcepts: [], summary: { overview: '' } };
};

// ─── Public: session summary enrichment ─────────────────────────
export type SessionSummaryContext = {
  sessionCount: number;
  totalFocusMinutes: number;
  averageQuality: number;
  streakDays: number;
  xpEarned: number;
  challengesCompleted: number;
  bossDamageDealt?: number;
  preferredTimeOfDay?: string;
  consistencyScore?: number;
};

export type EnrichedSessionContext = SessionSummaryContext & {
  sessionDurationMinutes?: number;
  purityScore?: number;
  subjectHint?: string;
};

export async function enrichSessionSummaryContext(
  userId: string,
  context: SessionSummaryContext,
): Promise<EnrichedSessionContext> {
  const latestSessionContext = await getLatestSessionAIContext(userId);
  return {
    ...context,
    ...(typeof latestSessionContext.sessionDurationMinutes === 'number'
      ? { sessionDurationMinutes: latestSessionContext.sessionDurationMinutes }
      : {}),
    ...(typeof latestSessionContext.purityScore === 'number'
      ? { purityScore: latestSessionContext.purityScore }
      : {}),
    ...(latestSessionContext.subjectHint
      ? { subjectHint: latestSessionContext.subjectHint }
      : {}),
  };
}

// ─── Latest session AI context ──────────────────────────────────
type SessionAIContext = {
  sessionDurationMinutes?: number;
  purityScore?: number;
  subjectHint?: string;
};

export async function getLatestSessionAIContext(
  userId: string,
): Promise<SessionAIContext> {
  const latestSession = await getLatestSession(userId);
  if (!latestSession) {
    return {};
  }

  const sessionRepository = getSessionRepository(userId);
  const summary =
    latestSession.summary ??
    (await sessionRepository.getSessionSummary(latestSession.sessionId));

  const parsedNotes = parseSessionNotes(latestSession.config.notes);
  const generationId = latestSession.config.tags.includes('content-study')
    ? (parsedNotes?.generationId ??
      findGenerationIdInTags(latestSession.config.tags))
    : undefined;

  const subjectHint = await deriveSubjectHint(
    generationId,
    parsedNotes?.focusAreas,
  );

  return {
    ...(typeof summary?.actualDuration === 'number'
      ? {
          sessionDurationMinutes: Math.max(
            1,
            Math.round(summary.actualDuration / 60),
          ),
        }
      : {}),
    ...(typeof summary?.focusPurityScore === 'number'
      ? { purityScore: Math.round(summary.focusPurityScore) }
      : {}),
    ...(subjectHint ? { subjectHint } : {}),
  };
}

// ─── Latest session fetch ───────────────────────────────────────
async function getLatestSession(
  userId: string,
): Promise<SessionHistoryEntry | null> {
  const sessionService = getSessionService();
  sessionService.setUserId(userId);
  if (hasRecentSessionsMethod(sessionService)) {
    const recentSessions = await sessionService.getRecentSessions(userId, 1);
    return recentSessions[0] ?? null;
  }
  const recentSessions = await sessionService.getSessionHistory(1);
  return recentSessions[0] ?? null;
}

function hasRecentSessionsMethod(
  service: ReturnType<typeof getSessionService>,
): service is ReturnType<typeof getSessionService> & {
  getRecentSessions: (
    userId: string,
    limit: number,
  ) => Promise<SessionHistoryEntry[]>;
} {
  return (
    'getRecentSessions' in service &&
    typeof service.getRecentSessions === 'function'
  );
}

// ─── Notes parsing ──────────────────────────────────────────────
function parseSessionNotes(
  notes: string | undefined,
): z.infer<typeof SessionNotesSchema> | null {
  if (!notes) {
    return null;
  }
  try {
    return SessionNotesSchema.parse(JSON.parse(notes) as unknown);
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'ai-coach',
      operation: 'ui-fallback',
      type: 'ui',
    });
    return null;
  }
}

// ─── Tag/generation helpers ─────────────────────────────────────
function findGenerationIdInTags(tags: string[]): string | undefined {
  return tags.find((tag) => tag !== 'content-study' && tag.length > 8);
}

async function deriveSubjectHint(
  generationId?: string,
  focusAreas?: string[],
): Promise<string | undefined> {
  if (focusAreas && focusAreas.length > 0) {
    return focusAreas[0];
  }
  if (!generationId) {
    return undefined;
  }
  const generation = await fetchGenerationRecord(generationId).catch(
    () => null,
  );
  if (!generation) {
    return undefined;
  }
  return (
    generation.keyConcepts[0]?.term ??
    generation.summary.overview?.split('.').shift()
  );
}
