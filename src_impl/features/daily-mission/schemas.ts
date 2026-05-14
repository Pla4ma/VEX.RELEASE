/**
 * Daily Mission Schemas
 *
 * Defines the structure for daily missions and priority system.
 */

import { z } from 'zod';

export const MissionTypeSchema = z.enum([
  'first-session',
  'sync-repair',
  'streak-critical',
  'comeback-quest',
  'daily-challenge',
  'boss-fight',
  'companion-care',
  'coach-action',
  'squad-goal',
  'default-focus',
]);

export type MissionType = z.infer<typeof MissionTypeSchema>;

export const DailyMissionSchema = z.object({
  id: z.string().uuid(),
  type: MissionTypeSchema,
  priority: z.number().int().min(1).max(10),
  title: z.string().min(1),
  reason: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaRoute: z.string().min(1),
  targetSystem: z.string().min(1),
  expiresAt: z.number().int().positive(),
  analyticsPayload: z.record(z.unknown()),
  isCompleted: z.boolean(),
  progress: z.number().min(0).max(1),
});

export type DailyMission = z.infer<typeof DailyMissionSchema>;

export const MissionPriorityInputSchema = z.object({
  isFirstSession: z.boolean(),
  hasPendingSyncRepair: z.boolean(),
  isStreakCritical: z.boolean(),
  hasComebackQuest: z.boolean(),
  hasActiveDailyChallenge: z.boolean(),
  isBossNearDefeat: z.boolean(),
  isBossEnabled: z.boolean(),
  needsCompanionCare: z.boolean(),
  hasCoachAction: z.boolean(),
  hasSquadWeeklyGoal: z.boolean(),
  isSquadsEnabled: z.boolean(),
  userId: z.string().uuid(),
});

export type MissionPriorityInput = z.infer<typeof MissionPriorityInputSchema>;
