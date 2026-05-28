import { captureSilentFailure } from "../../utils/silent-failure";

import { getDefaultStorageAdapter } from "../../persistence/MMKVStorageAdapter";
import {
  parseJsonWithSchema,
  stringifyJsonSafe,
} from "../../persistence/safe-json";
import type { SessionSummary } from "../../session/types";
import type { CompanionMood, CompanionState } from "./types";
import { EVOLUTION_THRESHOLDS } from "./types";
import {
  companionStateSchema,
  companionGrowthSchema,
  createDefaultCompanion,
} from "./companion-schemas";
import type { CompanionGrowth } from "./companion-schemas";

export { companionStateSchema, companionGrowthSchema, createDefaultCompanion };
export type { CompanionGrowth };

const storage = getDefaultStorageAdapter();

function stateKey(userId: string): string {
  return `companion_state_${userId}`;
}

function growthKey(userId: string, sessionId: string): string {
  return `companion_growth_${userId}_${sessionId}`;
}

export async function loadCompanionState(
  userId: string,
): Promise<CompanionState> {
  const key = stateKey(userId);
  const raw = await storage.getItem(key);
  if (!raw) {
    return createDefaultCompanion(userId);
  }
  return (
    parseJsonWithSchema(raw, companionStateSchema, {
      feature: "companion",
      key,
    }) ?? createDefaultCompanion(userId)
  );
}

export async function saveCompanionState(
  state: CompanionState,
): Promise<CompanionState> {
  const next = { ...state, updatedAt: Date.now() };
  const key = stateKey(state.userId);
  const encoded = stringifyJsonSafe(next, { feature: "companion", key });
  if (encoded) {
    await storage.setItem(key, encoded);
  }
  return next;
}

export async function saveCompanionGrowth(
  userId: string,
  growth: CompanionGrowth,
): Promise<void> {
  const key = growthKey(userId, growth.sessionId);
  const encoded = stringifyJsonSafe(growth, { feature: "companion", key });
  if (encoded) {
    await storage.setItem(key, encoded);
  }
}

export async function loadCompanionGrowth(
  userId: string,
  sessionId: string,
): Promise<CompanionGrowth | null> {
  const key = growthKey(userId, sessionId);
  const raw = await storage.getItem(key);
  if (!raw) {
    return null;
  }
  return parseJsonWithSchema(raw, companionGrowthSchema, {
    feature: "companion",
    key,
  });
}

export function getMoodForSessionSummary(
  summary: SessionSummary,
): CompanionMood {
  const purity = summary.focusPurityScore ?? summary.focusQuality ?? 0;
  const finalScore = summary.finalScore ?? 0;
  if ((finalScore && finalScore >= 95) || (purity && purity >= 95)) {
    return "ECSTATIC";
  }
  if ((finalScore && finalScore >= 70) || (purity && purity >= 70)) {
    return "CONTENT";
  }
  return "SLEEPY";
}

export function getEvolutionProgress(state: CompanionState): number {
  const threshold = EVOLUTION_THRESHOLDS[state.phase];
  if (!Number.isFinite(threshold) || threshold <= 0) {
    return 1;
  }
  return Math.max(0, Math.min(1, state.totalFocusMinutes / threshold));
}

/**
 * Load recent session moods for companion history display
 * PHASE 13.1 - Returns last N session moods for history dots
 */
export async function loadRecentSessionMoods(
  userId: string,
  limit: number = 5,
): Promise<
  Array<{ mood: CompanionMood; timestamp: number; sessionId: string }>
> {
  // Search for all companion growth keys for this user
  const allKeys = await storage.getAllKeys();
  const growthKeys = allKeys.filter((k) =>
    k.startsWith(`companion_growth_${userId}_`),
  );

  // Load all growth records
  const growthRecords = await Promise.all(
    growthKeys.map(async (key) => {
      const raw = await storage.getItem(key);
      if (!raw) {
        return null;
      }
      try {
        const decoded: unknown = JSON.parse(raw);
        const parsed = companionGrowthSchema.safeParse(decoded);
        if (parsed.success) {
          return {
            mood: parsed.data.mood,
            timestamp: parsed.data.updatedAt,
            sessionId: parsed.data.sessionId,
          };
        }
        return null;
      } catch (error) {
        captureSilentFailure(error, {
          feature: "companion",
          operation: "safe-fallback",
          type: "data",
        });
        return null;
      }
    }),
  );

  // Filter valid records, sort by timestamp desc, take limit
  return growthRecords
    .filter(
      (r): r is { mood: CompanionMood; timestamp: number; sessionId: string } =>
        r !== null,
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
