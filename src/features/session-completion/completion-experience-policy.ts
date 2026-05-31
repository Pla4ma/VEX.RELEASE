import { z } from 'zod';

import {
  AdaptivePayoffSchema,
  CompletionExperiencePolicyInputSchema,
  CompletionExperiencePolicySchema,
  PolicyBeatSchema,
  type CompletionExperiencePolicy,
  type CompletionExperiencePolicyInput,
  type CompletionSurface,
} from './completion-experience-policy-schemas';

export type {
  CompletionExperiencePolicy,
  CompletionExperiencePolicyInput,
  CompletionSurface,
  CompletionBeatKind,
  CompletionPolicyBeats,
} from './completion-experience-policy-schemas';

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
  const isStudy =
    style === 'study_focused' ||
    style === 'student' ||
    input.primaryGoal === 'STUDY';
  const isGame =
    style === 'game_like' || style === 'competitive' || style === 'intense';

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

function isCleanMode(input: CompletionExperiencePolicyInput): boolean {
  if (input.lane === 'minimal_normal') {return true;}
  return input.motivationStyle === 'calm';
}

function resolveAnimation(
  input: CompletionExperiencePolicyInput,
): 'none' | 'minimal' | 'low_medium' | 'medium_high' {
  if (isCleanMode(input)) {return 'minimal';}
  const style = input.motivationStyle;
  if (style === 'game_like' || style === 'competitive' || style === 'intense')
    {return 'medium_high';}
  return 'low_medium';
}

export function resolveCompletionExperiencePolicy(
  rawInput: unknown,
): CompletionExperiencePolicy {
  const input = CompletionExperiencePolicyInputSchema.parse(rawInput);
  const cleanMode = isCleanMode(input);
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

  const heroBeat: z.infer<typeof PolicyBeatSchema> = cleanMode
    ? { kind: 'completion_confirmation', surface: 'hero_minimal' }
    : { kind: 'completion_confirmation', surface: 'hero' };
  const progressBeat: z.infer<typeof PolicyBeatSchema> = {
    kind: 'xp_streak_progress',
    surface: 'progression',
  };
  const reflectionBeat: z.infer<typeof PolicyBeatSchema> = {
    kind: 'coach_companion_reflection',
    surface: 'hero_body',
  };

  return CompletionExperiencePolicySchema.parse({
    adaptivePayoff,
    animationLevel: resolveAnimation(input),
    beats: { heroBeat, progressBeat, reflectionBeat, adaptivePayoff },
    heroBeat,
    hiddenCompletionSurfaces,
    nextAction:
      adaptivePayoff === 'coach_next_action'
        ? 'coach_next_action'
        : 'start_next_focus',
    progressBeat,
    reflectionBeat,
  });
}
