import { z } from 'zod';

import { SessionSummarySchema } from '../../session/types';
import type { CompletionExperiencePolicy } from './completion-experience-policy';

const CompletionPayoffSchema = z
  .object({
    body: z.string().min(1),
    label: z.string().min(1),
    title: z.string().min(1),
    value: z.string().min(1),
  })
  .strict();

const BuildCompletionPayoffInputSchema = z
  .object({
    adaptivePayoff: z.enum([
      'study_progress',
      'boss_damage',
      'coach_next_action',
      'progress_insight',
    ]),
    bossDamage: z.number().nonnegative().nullable(),
    coachActionLabel: z.string().min(1).nullable(),
    study: z
      .object({
        nextTopic: z.string().min(1).nullable(),
        progressLabel: z.string().min(1),
        title: z.string().min(1),
      })
      .nullable(),
    summary: SessionSummarySchema,
  })
  .strict();

export type CompletionPayoff = z.infer<typeof CompletionPayoffSchema>;
export type BuildCompletionPayoffInput = z.infer<typeof BuildCompletionPayoffInputSchema>;

export function buildCompletionAdaptivePayoff(
  rawInput: BuildCompletionPayoffInput,
): CompletionPayoff {
  const input = BuildCompletionPayoffInputSchema.parse(rawInput);

  if (input.adaptivePayoff === 'study_progress' && input.study) {
    return CompletionPayoffSchema.parse({
      body: input.study.nextTopic
        ? `Next review: ${input.study.nextTopic}`
        : 'Your study plan is ready for the next focused review.',
      label: 'STUDY PROGRESS',
      title: input.study.title,
      value: input.study.progressLabel,
    });
  }

  if (input.adaptivePayoff === 'boss_damage') {
    const damage = input.bossDamage ?? input.summary.damage?.totalDamage ?? 0;
    return CompletionPayoffSchema.parse({
      body: damage > 0
        ? 'That focus landed as visible pressure.'
        : 'Boss pressure stays queued for the next focused run.',
      label: 'BOSS DAMAGE',
      title: 'Focus hit the boss.',
      value: damage > 0 ? `${damage} damage` : 'Pressure banked',
    });
  }

  if (input.adaptivePayoff === 'coach_next_action') {
    return CompletionPayoffSchema.parse({
      body: 'Use the next move while this session is still fresh.',
      label: 'COACH NEXT ACTION',
      title: input.coachActionLabel ?? 'Start the next clean block.',
      value: 'Next action set',
    });
  }

  return CompletionPayoffSchema.parse({
    body: input.summary.focusPurityScore
      ? `${input.summary.focusPurityScore}% purity with ${input.summary.completionPercentage}% completion.`
      : 'Your session progress is saved and ready to compound.',
    label: 'PROGRESS INSIGHT',
    title: 'Progress moved forward.',
    value: `+${input.summary.xpEarned ?? 0} XP`,
  });
}

export function countFinalReleaseCompletionBeats(
  policy: CompletionExperiencePolicy,
): number {
  return new Set([
    policy.heroBeat.kind,
    policy.progressBeat.kind,
    policy.reflectionBeat.kind,
    policy.adaptivePayoff,
  ]).size;
}
