

import {
  HomeReturnReasonStateSchema,
  type HomeHighlight,
  type HomeReturnReasonState,
} from './schemas';
import type { RecommendationType } from './types';

const DAILY_ANCHOR_MINUTES = 120;
const DEFAULT_FOCUS_BLOCK_MINUTES = 25;
const STREAK_SAVE_MINUTES = 15;

function getRemainingDailyMinutes(todayFocusMinutes: number): number {
  return Math.max(0, DAILY_ANCHOR_MINUTES - todayFocusMinutes);
}

function getNextBlockMinutes(remainingMinutes: number): number {
  return Math.max(
    STREAK_SAVE_MINUTES,
    Math.min(DEFAULT_FOCUS_BLOCK_MINUTES, remainingMinutes),
  );
}

function getProjectedDailyPercent(
  todayFocusMinutes: number,
  nextBlockMinutes: number,
): number {
  return Math.min(
    100,
    Math.round(
      ((todayFocusMinutes + nextBlockMinutes) / DAILY_ANCHOR_MINUTES) * 100,
    ),
  );
}

export function buildDisplayedReturnReason(
  homeHighlight: HomeHighlight | null,
  returnReason: HomeReturnReasonState,
): HomeReturnReasonState {
  if (!homeHighlight) {
    return returnReason;
  }

  return HomeReturnReasonStateSchema.parse({
    ...returnReason,
    body: homeHighlight.message,
    source: 'completion-highlight',
    title: homeHighlight.title,
    tone: homeHighlight.tone,
  });
}

export function buildPrimaryAction(input: {
  currentStreak: number;
  isAtRisk: boolean;
  isFirstRun: boolean;
}) {
  if (input.isFirstRun) {
    return {
      body: 'Fast start comes first. You can tune the session after the loop feels real.',
      ctaLabel: 'Start first session',
      eyebrow: 'Primary action',
      title: 'Start your first clean focus win',
    };
  }

  if (input.isAtRisk) {
    return {
      body: 'Use the one-tap path and protect the habit before anything else competes for attention.',
      ctaLabel: 'Protect streak',
      eyebrow: 'Primary action',
      title: 'Start the streak-saving session now',
    };
  }

  return {
    body:
      input.currentStreak > 0
        ? 'Keep the loop easy: start fast now, then open deeper setup only if you need it.'
        : 'A clean default is ready. Start first, customize second.',
    ctaLabel: 'Start focus session',
    eyebrow: 'Primary action',
    title: 'Start the next focus block with one tap',
  };
}

export function buildProgressSignal(input: {
  isAtRisk: boolean;
  isFirstRun: boolean;
  level: number;
  progressPercent: number;
  progressXp: number;
  todayFocusMinutes: number;
}) {
  if (input.isFirstRun) {
    return {
      body: 'Your first completion unlocks streaks, XP, and smarter reasons to come back tomorrow.',
      ctaLabel: 'Open progress',
      eyebrow: 'Progress signal',
      title: 'The core loop unlocks after session one',
    };
  }

  const remainingMinutes = getRemainingDailyMinutes(input.todayFocusMinutes);

  if (remainingMinutes === 0) {
    return {
      body: `You have ${input.todayFocusMinutes} focus minutes banked. The habit is protected, so the next useful move is optional extra progress, not panic.`,
      ctaLabel: 'Open progress',
      eyebrow: 'Daily momentum',
      title: 'Today already has a real focus win',
    };
  }

  if (input.todayFocusMinutes > 0) {
    const nextBlockMinutes = getNextBlockMinutes(remainingMinutes);
    const projectedPercent = getProjectedDailyPercent(
      input.todayFocusMinutes,
      nextBlockMinutes,
    );

    return {
      body: `${remainingMinutes} minutes remain in today's anchor. A ${nextBlockMinutes}-minute block moves the day to ${projectedPercent}% and keeps Level ${input.level} compounding.`,
      ctaLabel: 'Open progress',
      eyebrow: 'Daily momentum',
      title: `${input.todayFocusMinutes} focus minutes are already banked`,
    };
  }

  return {
    body: input.isAtRisk
      ? `A ${STREAK_SAVE_MINUTES}-minute save is enough to keep the streak alive. Start there before the rest of the app asks for attention.`
      : `A ${DEFAULT_FOCUS_BLOCK_MINUTES}-minute anchor starts today's loop and turns Level ${input.level}'s ${input.progressXp} XP into visible movement.`,
    ctaLabel: 'Open progress',
    eyebrow: 'Daily momentum',
    title: input.isAtRisk
      ? 'Your streak needs one clean rep today'
      : 'Today needs one anchor session',
  };
}

export const recommendationTitleMap: Record<RecommendationType, string> = {
  OPTIMAL_TIME: 'This is a strong time to focus',
  STREAK_PROTECTION: 'Protect your streak now',
  COMEBACK_BUILDER: 'Start the comeback here',
  DIFFICULTY_ADJUST: 'Use a smarter session today',
  CHALLENGE_SYNC: 'You have a challenge-ready session',
  BOSS_PREP: 'Turn this session into battle prep',
  HABIT_BUILDER: 'Build the habit with one clean win',
  ENERGY_BASED: "Match today's energy",
};
