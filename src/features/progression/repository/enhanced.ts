import * as repository from "../repository";
import type { Progression, XpEntry } from "../schemas";

export type EnhancedRepositoryErrorCode =
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNKNOWN";

export interface EnhancedRepositoryError {
  code: EnhancedRepositoryErrorCode;
  message: string;
  isRetryable: boolean;
}

export interface RepositoryResult<T> {
  data: T | null;
  error: EnhancedRepositoryError | null;
}

type ProgressionUpdate = {
  xp: number;
  totalXp: number;
  level: number;
  nextLevelThreshold: number;
  lastLevelUpAt: number | null;
};

type XpEntryInput = Omit<XpEntry, "id" | "userId">;

type LevelUpInput = {
  level: number;
  achievedAt: number;
  xpAtLevel: number;
  metadata: Record<string, unknown> | null;
};

export type XpStatsPeriod = "day" | "week" | "month";

export interface XpStats {
  total: number;
  bySource: Record<string, number>;
}

function toRepositoryError(error: unknown): EnhancedRepositoryError {
  const message =
    error instanceof Error ? error.message : "Unknown repository error";
  const lowerMessage = message.toLowerCase();
  const isNetwork =
    lowerMessage.includes("network") ||
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("fetch");
  const isConflict =
    lowerMessage.includes("conflict") ||
    lowerMessage.includes("duplicate") ||
    lowerMessage.includes("23505");

  return {
    code: isNetwork ? "NETWORK_ERROR" : isConflict ? "CONFLICT" : "UNKNOWN",
    message,
    isRetryable: isNetwork || isConflict,
  };
}

function getPeriodStart(period: XpStatsPeriod): number {
  const start = new Date();

  if (period === "day") {
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  }

  if (period === "week") {
    start.setDate(start.getDate() - 7);
    return start.getTime();
  }

  start.setMonth(start.getMonth() - 1);
  return start.getTime();
}

export async function fetchProgressionEnhanced(
  userId: string,
): Promise<RepositoryResult<Progression>> {
  try {
    const existing = await repository.fetchProgression(userId);
    const progression =
      existing ?? (await repository.createProgression(userId));
    return { data: progression, error: null };
  } catch (error) {
    return { data: null, error: toRepositoryError(error) };
  }
}

export async function updateProgressionEnhanced(
  userId: string,
  updates: ProgressionUpdate,
): Promise<RepositoryResult<Progression>> {
  try {
    const progression = await repository.updateProgression(userId, {
      level: updates.level,
      xp: updates.xp,
      total_xp: updates.totalXp,
      next_level_threshold: updates.nextLevelThreshold,
      last_level_up_at: updates.lastLevelUpAt,
    });
    return { data: progression, error: null };
  } catch (error) {
    return { data: null, error: toRepositoryError(error) };
  }
}

export async function recordXpEntryEnhanced(
  userId: string,
  entry: XpEntryInput,
  _options?: { queueIfOffline?: boolean },
): Promise<RepositoryResult<XpEntry>> {
  try {
    const xpEntry = await repository.recordXpEntry(userId, entry);
    return { data: xpEntry, error: null };
  } catch (error) {
    return { data: null, error: toRepositoryError(error) };
  }
}

export async function recordLevelUpEnhanced(
  userId: string,
  entry: LevelUpInput,
): Promise<RepositoryResult<void>> {
  try {
    await repository.recordLevelUp(userId, entry.level, entry.xpAtLevel);
    return { data: undefined, error: null };
  } catch (error) {
    return { data: null, error: toRepositoryError(error) };
  }
}

export async function fetchXpStats(
  userId: string,
  period: XpStatsPeriod,
): Promise<RepositoryResult<XpStats>> {
  try {
    const history = await repository.fetchXpHistory(userId, {
      since: getPeriodStart(period),
    });
    const stats = history.reduce<XpStats>(
      (current, entry) => ({
        total: current.total + entry.amount,
        bySource: {
          ...current.bySource,
          [entry.source]: (current.bySource[entry.source] ?? 0) + entry.amount,
        },
      }),
      { total: 0, bySource: {} },
    );
    return { data: stats, error: null };
  } catch (error) {
    return { data: null, error: toRepositoryError(error) };
  }
}
