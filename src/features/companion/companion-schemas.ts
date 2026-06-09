import { z } from 'zod';

import { EVOLUTION_THRESHOLDS } from './types';
import type { CompanionState } from './types';

export const companionStateSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    phase: z.enum([
      'EGG',
      'HATCHING',
      'YOUNG',
      'MATURE',
      'AWAKENED',
      'TRANSCENDENT',
    ]),
    level: z.number(),
    totalFocusMinutes: z.number(),
    element: z.enum(['FLAME', 'WAVE', 'TERRA', 'ZEPHYR', 'VOID', 'LUMINA']),
    elementAffinity: z.number(),
    currentMood: z.enum([
      'SLEEPY',
      'CONTENT',
      'FOCUSED',
      'DETERMINED',
      'ECSTATIC',
      'STRUGGLING',
      'DANGER',
    ]),
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
  })
  .strict();

export const companionGrowthSchema = z
  .object({
    sessionId: z.string(),
    mood: z.enum([
      'SLEEPY',
      'CONTENT',
      'FOCUSED',
      'DETERMINED',
      'ECSTATIC',
      'STRUGGLING',
      'DANGER',
    ]),
    level: z.number(),
    phase: z.enum([
      'EGG',
      'HATCHING',
      'YOUNG',
      'MATURE',
      'AWAKENED',
      'TRANSCENDENT',
    ]),
    progressToEvolution: z.number().min(0).max(1),
    totalFocusMinutes: z.number(),
    leveledUp: z.boolean(),
    evolved: z.boolean(),
    updatedAt: z.number(),
  })
  .strict();

export type CompanionGrowth = z.infer<typeof companionGrowthSchema>;

export function createDefaultCompanion(
  userId: string,
  options?: { element?: CompanionState['element'] },
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
