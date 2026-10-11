import { z } from 'zod';

import {
  BehaviorStatsSchema,
  VexPersonalizationProfileSchema,
} from '../../features/personalization/core-schemas';

export const RuntimeAuthStatusSchema = z.enum([
  'unknown',
  'checking',
  'authenticated',
  'signed_out',
  'error',
]);

export const RuntimeConnectionStateSchema = z.enum([
  'unknown',
  'online',
  'offline',
]);

export const RuntimeSourceFreshnessSchema = z
  .object({
    auth: z.number().int().min(0),
    onboarding: z.number().int().min(0),
    behavior: z.number().int().min(0),
  })
  .strict();

export const UserRuntimeSnapshotSchema = z
  .object({
    userId: z.string().min(1),
    authStatus: RuntimeAuthStatusSchema,
    onboardingProfile: VexPersonalizationProfileSchema.nullable(),
    behaviorStats: BehaviorStatsSchema,
    networkState: RuntimeConnectionStateSchema,
    premiumReady: z.boolean(),
    sourceFreshness: RuntimeSourceFreshnessSchema,
    capturedAt: z.number().int().min(0),
    version: z.literal(1),
  })
  .strict();

export type RuntimeAuthStatus = z.infer<typeof RuntimeAuthStatusSchema>;
export type RuntimeConnectionState = z.infer<
  typeof RuntimeConnectionStateSchema
>;
export type RuntimeSourceFreshness = z.infer<
  typeof RuntimeSourceFreshnessSchema
>;
export type UserRuntimeSnapshot = z.infer<typeof UserRuntimeSnapshotSchema>;
