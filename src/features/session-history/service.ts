import { SessionMode, resolveSessionMode } from '../../session/modes';
import { SessionStatusSchema } from '../../session/types';
import { fetchSessionHistoryRows } from './repository';
import {
  SessionHistoryMetadataSchema,
  SessionHistoryViewModelSchema,
  type SessionHistoryItem,
  type SessionHistoryStats,
  type SessionHistoryViewModel,
  type SupabaseSessionRow,
} from './schemas';

function parseTimestamp(value: string | null, fallback: string): number {
  const parsed = Date.parse(value ?? fallback);
  return Number.isNaN(parsed) ? Date.parse(fallback) : parsed;
}

function normalizeStatus(status: string): SessionHistoryItem['status'] {
  const parsed = SessionStatusSchema.safeParse(status.toUpperCase());
  return parsed.success ? parsed.data : 'DEGRADED';
}

function titleForMode(mode: SessionMode): string {
  switch (mode) {
    case SessionMode.DEEP_WORK:
      return 'Deep work';
    case SessionMode.STUDY:
      return 'Study focus';
    case SessionMode.CREATIVE:
      return 'Creative focus';
    case SessionMode.SPRINT:
      return 'Sprint focus';
    case SessionMode.RECOVERY:
      return 'Recovery focus';
    case SessionMode.STARTER:
      return 'Starter focus';
    default:
      return 'Focus session';
  }
}

function scoreFromQuality(qualityScore: number | null): number {
  if (qualityScore === null) {
    return 0;
  }
  return qualityScore <= 100 ? Math.round(qualityScore * 10) : qualityScore;
}

function gradeFromScore(score: number): SessionHistoryItem['grade'] {
  if (score >= 900) {
    return 'S';
  }
  if (score >= 800) {
    return 'A';
  }
  if (score >= 700) {
    return 'B';
  }
  if (score >= 600) {
    return 'C';
  }
  if (score >= 500) {
    return 'D';
  }
  return 'F';
}

export function mapSessionRowToHistoryItem(
  row: SupabaseSessionRow,
): SessionHistoryItem {
  const metadata = SessionHistoryMetadataSchema.parse(row.metadata ?? {});
  const mode = metadata.summary?.sessionMode ?? resolveSessionMode(row.mode);
  const summary = metadata.summary ?? null;
  const finalScore = summary?.finalScore ?? scoreFromQuality(row.quality_score);

  return {
    sessionId: row.id,
    userId: row.user_id,
    title: metadata.name ?? titleForMode(mode),
    status: normalizeStatus(row.status),
    mode,
    startedAtMs: parseTimestamp(row.started_at, row.created_at),
    completedAtMs: row.completed_at
      ? parseTimestamp(row.completed_at, row.created_at)
      : null,
    plannedDurationSeconds: row.duration,
    effectiveDurationSeconds:
      summary?.effectiveDuration ?? row.effective_duration ?? row.duration,
    finalScore,
    grade: gradeFromScore(finalScore),
    streakMaintained:
      summary?.streakMaintained ?? metadata.streakMaintained ?? false,
    summary,
  };
}

function buildStats(items: SessionHistoryItem[]): SessionHistoryStats {
  const completed = items.filter((item) => item.status === 'COMPLETED');
  const totalScore = items.reduce((sum, item) => sum + item.finalScore, 0);

  return {
    totalSessions: items.length,
    completedSessions: completed.length,
    totalFocusSeconds: items.reduce(
      (sum, item) => sum + item.effectiveDurationSeconds,
      0,
    ),
    averageScore:
      items.length > 0 ? Math.round(totalScore / items.length) : null,
  };
}

export function buildSessionHistoryViewModel(
  rows: SupabaseSessionRow[],
): SessionHistoryViewModel {
  const items = rows.map(mapSessionRowToHistoryItem);
  return SessionHistoryViewModelSchema.parse({
    items,
    stats: buildStats(items),
  });
}

export async function getSessionHistoryViewModel(
  userId: string,
  limit = 50,
): Promise<SessionHistoryViewModel> {
  const rows = await fetchSessionHistoryRows(userId, limit);
  return buildSessionHistoryViewModel(rows);
}
