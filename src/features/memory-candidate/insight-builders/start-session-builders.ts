import type { InsightCategory, LearnedItem, WhatVEXLearnedInput } from '../schemas';

interface InsightBuilder {
  category: InsightCategory;
  condition: () => boolean;
  build: () => LearnedItem;
}

function makeId(input: WhatVEXLearnedInput, suffix: string): string {
  return `learned:${input.userId}:${suffix}`;
}

export function buildStartSessionInsights(
  input: WhatVEXLearnedInput,
  now: number,
): InsightBuilder[] {
  const sessionCount = input.totalSessions;

  return [
    {
      category: 'start_friction',
      condition: () => input.abandonedStarts >= 2 && sessionCount >= 2,
      build: () => ({
        id: makeId(input, 'start-friction-abandon'),
        observation: "You've opened the app without starting a few times.",
        evidence: `Setup was abandoned ${input.abandonedStarts} times.`,
        confidence: input.abandonedStarts >= 3 ? 'medium' : 'weak',
        insightCategory: 'start_friction',
        recommendedAction: 'Name one thing before opening. Clarity at entry reduces friction.',
        humilityNote: input.abandonedStarts < 4 ? 'A small pattern — might be noise.' : undefined,
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: 'start_friction',
      condition: () =>
        input.avgDelayBeforeStartSeconds !== undefined &&
        input.avgDelayBeforeStartSeconds >= 120 &&
        sessionCount >= 3,
      build: () => ({
        id: makeId(input, 'start-friction-delay'),
        observation: 'You take a while between opening and starting a session.',
        evidence: `Average delay of ${Math.round((input.avgDelayBeforeStartSeconds ?? 120) / 60)} minutes before starting.`,
        confidence: sessionCount >= 5 ? 'medium' : 'weak',
        insightCategory: 'start_friction',
        recommendedAction: 'Save one session preset. One tap start reduces setup friction.',
        humilityNote: sessionCount < 5 ? 'VEX is still learning your rhythm.' : undefined,
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: 'session_shape',
      condition: () =>
        input.shortCompletions >= 3 &&
        input.completedSessions >= 3 &&
        input.shortCompletions >= input.completedSessions * 0.6,
      build: () => ({
        id: makeId(input, 'session-shape-short'),
        observation: 'You more often complete sessions under 15 minutes.',
        evidence: `${input.shortCompletions} of ${input.completedSessions} completed sessions were short.`,
        confidence: input.completedSessions >= 5 ? 'medium' : 'weak',
        insightCategory: 'session_shape',
        recommendedAction: 'Short sessions work for you. Keep the default under 20 minutes.',
        humilityNote: sessionCount < 6 ? 'Early pattern — may shift with more data.' : undefined,
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: 'session_shape',
      condition: () =>
        input.bestDurationRangeMin !== undefined &&
        input.bestDurationRangeMax !== undefined &&
        sessionCount >= 4,
      build: () => ({
        id: makeId(input, 'session-shape-range'),
        observation: `You finish more when sessions are ${input.bestDurationRangeMin}–${input.bestDurationRangeMax} minutes.`,
        evidence: `Your last ${input.completedSessions} completed sessions cluster in that range.`,
        confidence: sessionCount >= 7 ? 'medium' : 'weak',
        insightCategory: 'session_shape',
        recommendedAction: 'Set your next session in this range.',
        humilityNote: sessionCount < 7 ? 'More sessions needed to confirm this range.' : undefined,
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: 'session_shape',
      condition: () => input.earlyQuits >= 2 && sessionCount >= 3,
      build: () => ({
        id: makeId(input, 'session-shape-early-quit'),
        observation: 'Some sessions end earlier than planned.',
        evidence: `You quit early ${input.earlyQuits} times.`,
        confidence: input.earlyQuits >= 4 ? 'medium' : 'weak',
        insightCategory: 'session_shape',
        recommendedAction: "Try naming the exit point before you start. Knowing when you'll stop reduces early quits.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: 'session_shape',
      condition: () => input.resumedAfterPause >= 1 && sessionCount >= 3,
      build: () => ({
        id: makeId(input, 'session-shape-resume'),
        observation: 'You come back after pausing.',
        evidence: `You've resumed ${input.resumedAfterPause} sessions after pausing.`,
        confidence: input.resumedAfterPause >= 3 ? 'medium' : 'weak',
        insightCategory: 'session_shape',
        recommendedAction: "Pausing isn't failure. Resume when ready.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
  ];
}
