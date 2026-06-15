import { z } from 'zod';

import { LaneSchema } from '../lane-engine/schemas';
import { SessionModeSchema } from '../../session/modes';
import { SessionSummarySchema } from '../../session/types/schemas';

export const MotivationStyleSchema = z.enum([
  'calm',
  'friendly',
  'game_like',
  'coach_led',
  'competitive',
  'intense',
  'study_focused',
  'student',
  'creator',
  'worker',
]);

export const PrimaryGoalSchema = z
  .enum(['WORK', 'STUDY', 'CREATIVE', 'PERSONAL'])
  .nullable();

export const AdaptivePayoffSchema = z.enum([
  'study_progress',
  'boss_damage',
  'coach_next_action',
  'progress_insight',
]);

export const CompletionSurfaceSchema = z.enum([
  'battle_pass_card',
  'premium_chest',
  'coins_gems_wallet',
  'shop_inventory_prompts',
  'rival_consequence_cards',
  'squad_consequence_cards',
  'multiple_reward_rows',
  'social_share_primary_action',
  'boss_consequence_card',
  'challenge_consequence_card',
  'contract_reflection_card',
  'companion_growth_card',
  'chest_reward_animation',
  'follow_through_cards',
  'mastery_card',
  'study_progress_card',
]);

export const PolicyBeatSchema = z
  .object({
    kind: z.string().min(1),
    surface: z.string().min(1),
  })
  .strict();

export const CompletionBeatKindSchema = z.enum([
  'completion_confirmation',
  'xp_streak_progress',
  'coach_companion_reflection',
  'study_progress',
  'boss_damage',
  'coach_next_action',
  'progress_insight',
]);

export const CompletionBeatSchema = z
  .object({
    kind: CompletionBeatKindSchema,
    surface: z.string().min(1),
  })
  .strict();

export const PolicyBeatsSchema = z
  .object({
    heroBeat: PolicyBeatSchema,
    progressBeat: PolicyBeatSchema,
    reflectionBeat: PolicyBeatSchema,
    adaptivePayoff: AdaptivePayoffSchema,
  })
  .strict();

export const CompletionExperiencePolicySchema = z
  .object({
    adaptivePayoff: AdaptivePayoffSchema,
    animationLevel: z.enum(['none', 'minimal', 'low_medium', 'medium_high']),
    beats: PolicyBeatsSchema,
    heroBeat: PolicyBeatSchema,
    hiddenCompletionSurfaces: z.array(CompletionSurfaceSchema),
    nextAction: z.enum([
      'coach_next_action',
      'home_return_plan',
      'start_next_focus',
    ]),
    progressBeat: PolicyBeatSchema,
    reflectionBeat: PolicyBeatSchema,
  })
  .strict();

export const CompletionExperiencePolicyInputSchema = z
  .object({
    consequences: z
      .object({
        boss: z.unknown().optional(),
        challenge: z.unknown().optional(),
        rival: z.unknown().optional(),
        squad: z.unknown().optional(),
      })
      .optional(),
    featureAvailability: z
      .object({
        boss: z.boolean(),
        challenges: z.boolean(),
        contractUsed: z.boolean(),
        progress: z.boolean(),
        study: z.boolean(),
      })
      .strict(),
    firstWeekStage: z.string().nullable(),
    lane: LaneSchema.optional(),
    motivationStyle: MotivationStyleSchema,
    premiumState: z.enum(['free', 'premium']),
    primaryGoal: PrimaryGoalSchema,
    sessionMode: SessionModeSchema,
    summary: SessionSummarySchema,
  })
  .strict();

export type CompletionExperiencePolicy = z.infer<
  typeof CompletionExperiencePolicySchema
>;
export type CompletionExperiencePolicyInput = z.infer<
  typeof CompletionExperiencePolicyInputSchema
>;
export type CompletionSurface = z.infer<typeof CompletionSurfaceSchema>;
export type CompletionBeatKind = z.infer<typeof CompletionBeatKindSchema>;
export type CompletionPolicyBeats = z.infer<typeof PolicyBeatsSchema>;
