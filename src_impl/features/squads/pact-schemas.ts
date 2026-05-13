import { z } from 'zod';

/**
 * Squad Pact Statuses
 * 
 * PROPOSED: Waiting for all members to commit currency
 * ACTIVE: Pact is live, tracking progress
 * MET: Goal achieved, stakes returned + bonus
 * FAILED: Goal missed, stakes burned (collective loss)
 * CANCELLED: Pact aborted before start
 */
export const PactStatusSchema = z.enum(['PROPOSED', 'ACTIVE', 'MET', 'FAILED', 'CANCELLED']);

export const PactGoalTypeSchema = z.enum([
  'TOTAL_FOCUS_HOURS',
  'SQUAD_STREAK_DAYS',
  'COLLECTIVE_BOSS_DAMAGE',
]);

export const SquadPactSchema = z.object({
  id: z.string().uuid(),
  squadId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  goalType: PactGoalTypeSchema,
  targetValue: z.number().positive(),
  currentValue: z.number().default(0),
  stakeAmountPerMember: z.number().int().min(100), // Min 100 coins
  stakeCurrency: z.enum(['COINS', 'GEMS']).default('COINS'),
  status: PactStatusSchema,
  expiresAt: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  membersInvolved: z.array(z.string().uuid()),
  committedMemberIds: z.array(z.string().uuid()).default([]),
}).strict();

export type SquadPact = z.infer<typeof SquadPactSchema>;
export type PactStatus = z.infer<typeof PactStatusSchema>;
export type PactGoalType = z.infer<typeof PactGoalTypeSchema>;

export const CreatePactInputSchema = z.object({
  squadId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  goalType: PactGoalTypeSchema,
  targetValue: z.number().positive(),
  stakeAmount: z.number().int().min(100),
  stakeCurrency: z.enum(['COINS', 'GEMS']).default('COINS'),
  durationDays: z.number().int().min(1).max(30),
}).strict();

export type CreatePactInput = z.infer<typeof CreatePactInputSchema>;
