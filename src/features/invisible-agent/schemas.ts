import { z } from 'zod';

export const CoachAgentDecisionTypeSchema = z.enum([
  'START_SESSION',
  'RESCUE_STREAK',
  'CONTINUE_STUDY_PLAN',
  'REVIEW_PROGRESS',
  'NO_ACTION',
]);

export const CoachAgentReasonCodeSchema = z.enum([
  'STREAK_AT_RISK',
  'LOW_ENERGY_PATTERN',
  'ACTIVE_STUDY_PLAN',
  'RECENT_MISSED_SESSION',
  'ENOUGH_DONE_TODAY',
]);

export const CoachAgentDecisionSchema = z.object({
  decisionId: z.string().min(1),
  userId: z.string().min(1),
  type: CoachAgentDecisionTypeSchema,
  message: z.string().min(1).max(220),
  reasonCode: CoachAgentReasonCodeSchema,
  confidence: z.number().min(0).max(1),
  actionPayload: z.record(z.string(), z.unknown()).optional(),
  expiresAt: z.string().datetime(),
  evidence: z.object({
    sessionIds: z.array(z.string()).optional(),
    memoryIds: z.array(z.string()).optional(),
    studyPackIds: z.array(z.string()).optional(),
  }),
  policy: z.object({
    requiresUserConfirmation: z.literal(true),
    canAutoExecute: z.literal(false),
  }),
});

export const AgentContextSnapshotSchema = z.object({
  userId: z.string().min(1),
  isOnline: z.boolean(),
  completedToday: z.boolean(),
  currentStreak: z.number().min(0),
  hoursUntilStreakDeadline: z.number().nullable(),
  recentSessionIds: z.array(z.string()),
  activeStudyPackId: z.string().nullable(),
  lowEnergyPattern: z.boolean(),
  trustLevel: z.enum(['low', 'normal']),
});

export type CoachAgentDecision = z.infer<typeof CoachAgentDecisionSchema>;
export type AgentContextSnapshot = z.infer<typeof AgentContextSnapshotSchema>;
