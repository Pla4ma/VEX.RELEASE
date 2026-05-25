import { z } from 'zod';

import { LaneSchema } from '../lane-engine/schemas';

export const UnlockDecisionTypeSchema = z.enum([
  'hidden',
  'teased',
  'unlocked',
  'blocked',
  'degraded',
]);

export const LaneFitSchema = z.enum([
  'strong',
  'medium',
  'weak',
  'blocked',
]);

export const UnlockEvidenceSchema = z.object({
  source: z.enum([
    'onboarding',
    'session_count',
    'behavior',
    'lane_profile',
    'manual_override',
    'cold_start',
  ]),
  detail: z.string().min(1),
  observedAt: z.number().int().min(0),
}).strict();

export const UnlockDecisionSchema = z.object({
  featureKey: z.string().min(1),
  decision: UnlockDecisionTypeSchema,
  reasonCode: z.string().min(1),
  userFacingReason: z.string().min(1),
  evidence: z.array(UnlockEvidenceSchema),
  laneFit: LaneFitSchema,
  canHide: z.boolean(),
  canReconsiderAtSessionCount: z.number().int().min(0).nullable(),
}).strict();

export const UnlockExplainerInputSchema = z.object({
  featureKey: z.string().min(1),
  laneProfile: LaneSchema.optional(),
  sessionCount: z.number().int().min(0),
  isPremium: z.boolean().optional().default(false),
  hasRelatedBehavior: z.boolean().optional().default(false),
  manualOverride: z
    .enum(['hidden', 'teased', 'unlocked', 'blocked', 'degraded'])
    .optional(),
}).strict();
