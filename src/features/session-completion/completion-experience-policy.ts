import { z } from 'zod';

import { SessionModeSchema } from '../../session/modes';
import { SessionSummarySchema } from '../../session/types';

const MotivationStyleSchema = z.enum([
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

const PrimaryGoalSchema = z.enum(['WORK', 'STUDY', 'CREATIVE', 'PERSONAL']).nullable();
const AdaptivePayoffSchema = z.enum([
  'study_progress',
  'boss_damage',
  'coach_next_action',
  'progress_insight',
]);
const CompletionSurfaceSchema = z.enum([
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

const PolicyBeatSchema = z
  .object({
    kind: z.string().min(1),
    surface: z.string().min(1),
  })
  .strict();

const CompletionBeatKindSchema = z.enum([
  'completion_confirmation',
  'xp_streak_progress',
  'coach_companion_reflection',
  'study_progress',
  'boss_damage',
  'coach_next_action',
  'progress_insight',
]);

const CompletionBeatSchema = z
  .object({
    kind: CompletionBeatKindSchema,
    surface: z.string().min(1),
  })
  .strict();

const PolicyBeatsSchema = z
  .object({
    heroBeat: PolicyBeatSchema,
    progressBeat: PolicyBeatSchema,
    reflectionBeat: PolicyBeatSchema,
    adaptivePayoff: AdaptivePayoffSchema,
  })
  .strict();

const CompletionExperiencePolicySchema = z
  .object({
    adaptivePayoff: AdaptivePayoffSchema,
    beats: PolicyBeatsSchema,
    heroBeat: PolicyBeatSchema,
    hiddenCompletionSurfaces: z.array(CompletionSurfaceSchema),
    nextAction: z.enum(['coach_next_action', 'home_return_plan', 'start_next_focus']),
    progressBeat: PolicyBeatSchema,
    reflectionBeat: PolicyBeatSchema,
  })
  .strict();

const CompletionExperiencePolicyInputSchema = z
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
    motivationStyle: MotivationStyleSchema,
    premiumState: z.enum(['free', 'premium']),
    primaryGoal: PrimaryGoalSchema,
    sessionMode: SessionModeSchema,
    summary: SessionSummarySchema,
  })
  .strict();

export type CompletionExperiencePolicy = z.infer<typeof CompletionExperiencePolicySchema>;
export type CompletionExperiencePolicyInput = z.infer<typeof CompletionExperiencePolicyInputSchema>;
export type CompletionSurface = z.infer<typeof CompletionSurfaceSchema>;
export type CompletionBeatKind = z.infer<typeof CompletionBeatKindSchema>;
export type CompletionPolicyBeats = z.infer<typeof PolicyBeatsSchema>;

function hasSurface(
  hiddenCompletionSurfaces: CompletionSurface[],
  surface: CompletionSurface,
): boolean {
  return hiddenCompletionSurfaces.includes(surface);
}

function pushHidden(
  hiddenCompletionSurfaces: CompletionSurface[],
  surface: CompletionSurface,
): void {
  if (!hasSurface(hiddenCompletionSurfaces, surface)) {
    hiddenCompletionSurfaces.push(surface);
  }
}

function resolveAdaptivePayoff(
  input: CompletionExperiencePolicyInput,
): z.infer<typeof AdaptivePayoffSchema> {
  const style = input.motivationStyle;
  const hasBoss = Boolean(input.consequences?.boss);
  const isStudy = style === 'study_focused' || style === 'student' || input.primaryGoal === 'STUDY';
  const isGame = style === 'game_like' || style === 'competitive' || style === 'intense';

  if (isStudy && input.featureAvailability.study) {
    return 'study_progress';
  }
  if (isGame && hasBoss && input.featureAvailability.boss) {
    return 'boss_damage';
  }
  if (style === 'coach_led') {
    return 'coach_next_action';
  }
  return 'progress_insight';
}

export function resolveCompletionExperiencePolicy(
  rawInput: unknown,
): CompletionExperiencePolicy {
  const input = CompletionExperiencePolicyInputSchema.parse(rawInput);
  const adaptivePayoff = resolveAdaptivePayoff(input);
  const hiddenCompletionSurfaces: CompletionSurface[] = [
    'battle_pass_card',
    'premium_chest',
    'coins_gems_wallet',
    'shop_inventory_prompts',
    'rival_consequence_cards',
    'squad_consequence_cards',
    'multiple_reward_rows',
    'social_share_primary_action',
    'chest_reward_animation',
    'follow_through_cards',
    'mastery_card',
    'companion_growth_card',
    'contract_reflection_card',
  ];

  if (adaptivePayoff !== 'boss_damage') {
    pushHidden(hiddenCompletionSurfaces, 'boss_consequence_card');
  }
  if (!input.featureAvailability.challenges || !input.consequences?.challenge) {
    pushHidden(hiddenCompletionSurfaces, 'challenge_consequence_card');
  }
  if (adaptivePayoff !== 'study_progress') {
    pushHidden(hiddenCompletionSurfaces, 'study_progress_card');
  }

  const heroBeat: z.infer<typeof PolicyBeatSchema> = { kind: 'completion_confirmation', surface: 'hero' };
  const progressBeat: z.infer<typeof PolicyBeatSchema> = { kind: 'xp_streak_progress', surface: 'progression' };
  const reflectionBeat: z.infer<typeof PolicyBeatSchema> = { kind: 'coach_companion_reflection', surface: 'hero_body' };

  return CompletionExperiencePolicySchema.parse({
    adaptivePayoff,
    beats: { heroBeat, progressBeat, reflectionBeat, adaptivePayoff },
    heroBeat,
    hiddenCompletionSurfaces,
    nextAction: adaptivePayoff === 'coach_next_action' ? 'coach_next_action' : 'start_next_focus',
    progressBeat,
    reflectionBeat,
  });
}
