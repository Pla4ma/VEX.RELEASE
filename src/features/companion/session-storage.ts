import { captureSilentFailure } from '../../utils/silent-failure';
import { z } from 'zod';

import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { parseJsonWithSchema, stringifyJsonSafe } from '../../persistence/safe-json';
import type { SessionSummary } from '../../session/types';
import type { CompanionMood, CompanionState } from './types';
import { EVOLUTION_THRESHOLDS } from './types';

const companionStateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  phase: z.enum(['EGG', 'HATCHING', 'YOUNG', 'MATURE', 'AWAKENED', 'TRANSCENDENT']),
  level: z.number(),
  totalFocusMinutes: z.number(),
  element: z.enum(['FLAME', 'WAVE', 'TERRA', 'ZEPHYR', 'VOID', 'LUMINA']),
  elementAffinity: z.number(),
  currentMood: z.enum(['SLEEPY', 'CONTENT', 'FOCUSED', 'DETERMINED', 'ECSTATIC', 'STRUGGLING', 'DANGER']),
  sessionProgress: z.number(),
  purityScore: z.number(),
  energyLevel: z.number(),
  visualSeed: z.number(),
  colorHue: z.number(),
  particleDensity: z.number(),
  sessionCount: z.number(),
  perfectSessions: z.number(),
  longestFocusStreak: z.number(),
  nextEvolutionAt: z.number(),
  updatedAt: z.number(),
}).strict();

export const companionGrowthSchema = z.object({
  sessionId: z.string(),
  mood: z.enum(['SLEEPY', 'CONTENT', 'FOCUSED', 'DETERMINED', 'ECSTATIC', 'STRUGGLING', 'DANGER']),
  level: z.number(),
  phase: z.enum(['EGG', 'HATCHING', 'YOUNG', 'MATURE', 'AWAKENED', 'TRANSCENDENT']),
  progressToEvolution: z.number().min(0).max(1),
  totalFocusMinutes: z.number(),
  leveledUp: z.boolean(),
  evolved: z.boolean(),
  updatedAt: z.number(),
}).strict();

export type CompanionGrowth = z.infer<typeof companionGrowthSchema>;

const storage = getDefaultStorageAdapter();

function stateKey(userId: string): string {
  return `companion_state_${userId}`;
}

function growthKey(userId: string, sessionId: string): string {
  return `companion_growth_${userId}_${sessionId}`;
}

export function createDefaultCompanion(
  userId: string,
  options?: { element?: CompanionState['element'] }
): CompanionState {
  const element = options?.element ?? 'FLAME';
  const hueMap: Record<CompanionState['element'], number> = {
    FLAME: 15,
    WAVE: 170,
    TERRA: 100,
    ZEPHYR: 200,
    VOID: 270,
    LUMINA: 45,
  };

  return {
    id: `companion_${userId}`,
    userId,
    phase: 'EGG',
    level: 1,
    totalFocusMinutes: 0,
    element,
    elementAffinity: 75,
    currentMood: 'SLEEPY',
    sessionProgress: 0,
    purityScore: 85,
    energyLevel: 50,
    visualSeed: 42,
    colorHue: hueMap[element],
    particleDensity: 0.8,
    sessionCount: 0,
    perfectSessions: 0,
    longestFocusStreak: 0,
    nextEvolutionAt: EVOLUTION_THRESHOLDS.EGG,
    updatedAt: Date.now(),
  };
}

export async function loadCompanionState(userId: string): Promise<CompanionState> {
  const key = stateKey(userId);
  const raw = await storage.getItem(key);
  if (!raw) {return createDefaultCompanion(userId);}
  return parseJsonWithSchema(raw, companionStateSchema, { feature: 'companion', key })
    ?? createDefaultCompanion(userId);
}

export async function saveCompanionState(state: CompanionState): Promise<CompanionState> {
  const next = { ...state, updatedAt: Date.now() };
  const key = stateKey(state.userId);
  const encoded = stringifyJsonSafe(next, { feature: 'companion', key });
  if (encoded) {
    await storage.setItem(key, encoded);
  }
  return next;
}

export async function saveCompanionGrowth(userId: string, growth: CompanionGrowth): Promise<void> {
  const key = growthKey(userId, growth.sessionId);
  const encoded = stringifyJsonSafe(growth, { feature: 'companion', key });
  if (encoded) {
    await storage.setItem(key, encoded);
  }
}

export async function loadCompanionGrowth(userId: string, sessionId: string): Promise<CompanionGrowth | null> {
  const key = growthKey(userId, sessionId);
  const raw = await storage.getItem(key);
  if (!raw) {return null;}
  return parseJsonWithSchema(raw, companionGrowthSchema, { feature: 'companion', key });
}

export function getMoodForSessionSummary(summary: SessionSummary): CompanionMood {
  const purity = summary.focusPurityScore ?? summary.focusQuality ?? 0;
  if (summary.finalScore >= 95 || purity >= 95) {return 'ECSTATIC';}
  if (summary.finalScore >= 70 || purity >= 70) {return 'CONTENT';}
  return 'SLEEPY';
}

export function getEvolutionProgress(state: CompanionState): number {
  const threshold = EVOLUTION_THRESHOLDS[state.phase];
  if (!Number.isFinite(threshold) || threshold <= 0) {return 1;}
  return Math.max(0, Math.min(1, state.totalFocusMinutes / threshold));
}

/**
 * Load recent session moods for companion history display
 * PHASE 13.1 - Returns last N session moods for history dots
 */
export async function loadRecentSessionMoods(
  userId: string,
  limit: number = 5
): Promise<Array<{ mood: CompanionMood; timestamp: number; sessionId: string }>> {
  // Search for all companion growth keys for this user
  const allKeys = await storage.getAllKeys();
  const growthKeys = allKeys.filter((k) => k.startsWith(`companion_growth_${userId}_`));

  // Load all growth records
  const growthRecords = await Promise.all(
    growthKeys.map(async (key) => {
      const raw = await storage.getItem(key);
      if (!raw) {return null;}
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
      } catch (error) { captureSilentFailure(error, { feature: 'companion', operation: 'safe-fallback', type: 'data' });
        return null;
      }
    })
  );

  // Filter valid records, sort by timestamp desc, take limit
  return growthRecords
    .filter((r): r is { mood: CompanionMood; timestamp: number; sessionId: string } => r !== null)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
