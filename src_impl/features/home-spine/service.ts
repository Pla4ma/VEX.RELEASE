import { z } from 'zod';

import { buildDisplayedReturnReason, buildPrimaryAction, buildProgressSignal, recommendationTitleMap } from './copy';
import {
  HomeHighlightSchema,
  HomeReturnReasonStateSchema,
  HomeSpineModelSchema,
  type HomeReturnReasonState,
  type HomeSpineModel,
} from './schemas';
import type { RecommendationType } from './types';

/*
Dependencies: completion highlight handoff, home return-reason ranking, home primary rail UI
Consumers: home screen controller, home primary rail, future home feature entry points
*/

const RecommendationSchema = z.object({
  id: z.string().min(1),
  reasoning: z.string().min(1),
  suggestedDifficulty: z.enum(['EASY', 'NORMAL', 'CHALLENGING', 'PUSH']),
  suggestedDuration: z.number().int().positive(),
  type: z.enum([
    'OPTIMAL_TIME',
    'STREAK_PROTECTION',
    'COMEBACK_BUILDER',
    'DIFFICULTY_ADJUST',
    'CHALLENGE_SYNC',
    'BOSS_PREP',
    'HABIT_BUILDER',
    'ENERGY_BASED',
  ]),
});

const NextBestActionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ctaLabel: z.string().min(1),
});

const ActiveStudyPlanSchema = z.object({
  completedTasks: z.number().int().min(0),
  remainingMinutes: z.number().int().min(0),
  title: z.string().min(1),
  totalTasks: z.number().int().min(0),
});

const HomeReturnReasonInputSchema = z.object({
  activeStudyPlan: ActiveStudyPlanSchema.nullable(),
  canShowExpansionSystems: z.boolean(),
  comebackMessage: z.string().nullable(),
  nextBestAction: NextBestActionSchema,
  primaryRecommendation: RecommendationSchema.nullable(),
});

const HomeSpineInputSchema = z.object({
  currentStreak: z.number().int().min(0),
  homeHighlight: HomeHighlightSchema.nullable(),
  isAtRisk: z.boolean(),
  isFirstRun: z.boolean(),
  level: z.number().int().min(1),
  progressPercent: z.number().int().min(0).max(100),
  progressXp: z.number().int().min(0),
  returnReason: HomeReturnReasonStateSchema,
  todayFocusMinutes: z.number().int().min(0),
});

export function buildHomeReturnReasonState(input: {
  activeStudyPlan: {
    completedTasks: number;
    remainingMinutes: number;
    title: string;
    totalTasks: number;
  } | null;
  canShowExpansionSystems: boolean;
  comebackMessage: string | null;
  nextBestAction: {
    ctaLabel: string;
    description: string;
    title: string;
  };
  primaryRecommendation: {
    id: string;
    reasoning: string;
    suggestedDifficulty: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';
    suggestedDuration: number;
    type: RecommendationType;
  } | null;
}): HomeReturnReasonState {
  const parsed = HomeReturnReasonInputSchema.parse(input);

  if (parsed.primaryRecommendation) {
    return HomeReturnReasonStateSchema.parse({
      body: parsed.primaryRecommendation.reasoning,
      ctaLabel: 'Take the suggestion',
      eyebrow: 'Return reason',
      intent: 'accept-coach-recommendation',
      recommendationId: parsed.primaryRecommendation.id,
      source: 'coach',
      suggestedDifficulty: parsed.primaryRecommendation.suggestedDifficulty,
      suggestedDurationSeconds: parsed.primaryRecommendation.suggestedDuration,
      title: recommendationTitleMap[parsed.primaryRecommendation.type],
      tone: 'default',
    });
  }

  if (parsed.comebackMessage) {
    return HomeReturnReasonStateSchema.parse({
      body: parsed.comebackMessage,
      ctaLabel: 'Start comeback session',
      eyebrow: 'Return reason',
      intent: 'start-session',
      source: 'comeback',
      title: 'Momentum comes back fast',
      tone: 'warning',
    });
  }

  if (parsed.activeStudyPlan && parsed.canShowExpansionSystems) {
    const remainingTasks = Math.max(
      0,
      parsed.activeStudyPlan.totalTasks - parsed.activeStudyPlan.completedTasks,
    );

    return HomeReturnReasonStateSchema.parse({
      body: `You have ${parsed.activeStudyPlan.remainingMinutes} minutes left across ${remainingTasks} tasks.`,
      ctaLabel: 'Continue study plan',
      eyebrow: 'Return reason',
      intent: 'continue-study-plan',
      source: 'study-plan',
      title: `Continue "${parsed.activeStudyPlan.title}"`,
      tone: 'info',
    });
  }

  return HomeReturnReasonStateSchema.parse({
    body: parsed.nextBestAction.description,
    ctaLabel: parsed.nextBestAction.ctaLabel,
    eyebrow: 'Return reason',
    intent: 'start-session',
    source: 'next-best-action',
    title: parsed.nextBestAction.title,
    tone: 'default',
  });
}

export function buildHomeSpineModel(input: {
  currentStreak: number;
  homeHighlight: z.infer<typeof HomeHighlightSchema> | null;
  isAtRisk: boolean;
  isFirstRun: boolean;
  level: number;
  progressPercent: number;
  progressXp: number;
  returnReason: HomeReturnReasonState;
  todayFocusMinutes: number;
}): HomeSpineModel {
  const parsed = HomeSpineInputSchema.parse(input);
  const returnReason = buildDisplayedReturnReason(
    parsed.homeHighlight,
    parsed.returnReason,
  );

  return HomeSpineModelSchema.parse({
    primaryAction: buildPrimaryAction({
      currentStreak: parsed.currentStreak,
      isAtRisk: parsed.isAtRisk,
      isFirstRun: parsed.isFirstRun,
    }),
    progressSignal: buildProgressSignal(parsed),
    returnReason,
  });
}
