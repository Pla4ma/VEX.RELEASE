/**
 * Session Completion Hero & Return Plan Builders
 *
 * Builds the hero section and return plan for the completion experience.
 */

import { SessionCompletionHeroSchema, type SessionCompletionHero } from './schemas';
import { SessionCompletionReturnPlanSchema, type SessionCompletionReturnPlan } from './schemas';

export function buildSessionCompletionHero(input: {
  focusedDurationLabel: string;
  interruptions: number;
  streakIncreased: boolean;
}): SessionCompletionHero {
  const clean = input.interruptions === 0;
  return SessionCompletionHeroSchema.parse({
    body: input.focusedDurationLabel,
    eyebrow: input.streakIncreased ? 'Streak protected' : 'Session complete',
    title: clean ? 'Clean finish.' : 'Work locked in.',
  });
}

export function buildSessionCompletionReturnPlan(input: {
  completionPercentage: number;
  hasStudyFollowUp: boolean;
  streakDays: number;
  streakIncreased: boolean;
}): SessionCompletionReturnPlan {
  const protectedStreak = input.streakIncreased && input.streakDays > 0;
  return SessionCompletionReturnPlanSchema.parse({
    highlightMessage: protectedStreak
      ? 'You protected momentum today.'
      : 'VEX saved this as a progress signal.',
    highlightTitle: protectedStreak
      ? `${input.streakDays}-day streak protected`
      : 'Session banked cleanly',
    highlightTone: input.completionPercentage >= 80 ? 'celebration' : 'info',
    homeCtaLabel: protectedStreak || input.hasStudyFollowUp
      ? 'See tomorrow plan'
      : 'Back home',
    nextSessionLabel: 'Bank another block',
    returnReasonBody: input.hasStudyFollowUp
      ? 'Your next plan step is ready from this progress signal.'
      : 'This progress signal helps VEX tune your next focus block.',
    returnReasonTitle: protectedStreak ? 'Tomorrow is queued' : 'Next useful action',
  });
}