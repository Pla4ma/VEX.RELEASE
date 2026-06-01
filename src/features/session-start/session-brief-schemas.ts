import { z } from 'zod';
import { LaneSchema } from '../lane-engine/schemas';
import { SessionModeSchema } from '../../session/modes';

// ============================================================================
// Session Stake Schema (Phase 2) — @deprecated Replaced by LaneSessionBrief
// ============================================================================

export const SessionStakeSchema = z
  .object({
    userId: z.string().uuid(),
    sessionId: z.string().uuid().optional(),

    // User choices
    selectedDurationSeconds: z.number().min(60).max(14400),
    selectedMode: z.enum([
      'LIGHT_FOCUS',
      'DEEP_WORK',
      'SPRINT',
      'CREATIVE',
      'STUDY',
      'RECOVERY',
      'STARTER',
    ]),
    selectedLoadout: z.array(z.string().min(1)).optional(),

    // Boss stakes (economy fields removed per Phase 5 plan)
    boss: z
      .object({
        encounterId: z.string().uuid().optional(),
        name: z.string(),
        healthRemaining: z.number(),
        maxHealth: z.number(),
        estimatedDamageMin: z.number(),
        estimatedDamageMax: z.number(),
        isFinalStrike: z.boolean(),
      })
      .optional(),

    // Streak stakes
    streak: z.object({
      currentDays: z.number(),
      status: z.enum(['SAFE', 'AT_RISK', 'CRITICAL']),
      hoursRemaining: z.number().optional(),
    }),

    // Challenge stakes
    challenges: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        progressBefore: z.number(),
        progressAfter: z.number(),
        willComplete: z.boolean(),
        reward: z.string().optional(),
      }),
    ),

    // Offline restrictions
    offlineLimitations: z.array(z.string()),
  })
  .strict();

export type SessionStake = z.infer<typeof SessionStakeSchema>;

export const LaneSessionBriefSchema = z
  .object({
    lane: LaneSchema,
    userFacingModeName: z.enum(['Study', 'Run', 'Project', 'Clean']),
    title: z.string().min(1),
    body: z.string().min(1),
    successCondition: z.string().min(1),
    sessionMode: SessionModeSchema,
    suggestedDurationSeconds: z
      .number()
      .int()
      .min(5 * 60)
      .max(180 * 60),
    risk: z
      .object({
        type: z.enum([
          'deadline',
          'avoidance',
          'streak',
          'project_stale',
          'none',
        ]),
        label: z.string().min(1),
      })
      .nullable(),
    friction: z
      .object({
        level: z.enum(['none', 'soft', 'medium', 'hard']),
        reason: z.string().min(1),
      })
      .nullable(),
    afterCompletion: z.string().min(1),
    ctaLabel: z.string().min(1),
    focusStrategyLoadout: z.array(z.string().min(1)),
    offlineMessage: z.string().nullable(),
  })
  .strict();

export type LaneSessionBrief = z.infer<typeof LaneSessionBriefSchema>;
