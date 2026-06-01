import type { InsightCategory, LearnedItem, WhatVEXLearnedInput } from '../schemas';

interface InsightBuilder {
  category: InsightCategory;
  condition: () => boolean;
  build: () => LearnedItem;
}

function makeId(input: WhatVEXLearnedInput, suffix: string): string {
  return `learned:${input.userId}:${suffix}`;
}

export function buildStudyGeneralInsights(
  input: WhatVEXLearnedInput,
  now: number,
): InsightBuilder[] {
  const sessionCount = input.totalSessions;

  return [
    {
      category: 'study_continuity',
      condition: () =>
        input.completedNamedStudyTargets >= 2 && sessionCount >= 3,
      build: () => ({
        id: makeId(input, 'study-named-target'),
        observation: 'You finish more study blocks when the target is named.',
        evidence: `${input.completedNamedStudyTargets} study blocks completed with named targets.`,
        confidence: input.completedNamedStudyTargets >= 4 ? 'medium' : 'weak',
        insightCategory: 'study_continuity',
        recommendedAction: 'Name one study target per block. Clarity before intensity.',
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: 'study_continuity',
      condition: () =>
        input.repeatedWeakTopics >= 1 && sessionCount >= 4,
      build: () => ({
        id: makeId(input, 'study-repeat-weak'),
        observation: 'You return to topics you marked for review.',
        evidence: `${input.repeatedWeakTopics} weak topics were repeated.`,
        confidence: input.repeatedWeakTopics >= 3 ? 'medium' : 'weak',
        insightCategory: 'study_continuity',
        recommendedAction: 'VEX will surface review topics before new material.',
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: 'study_continuity',
      condition: () =>
        input.usedReviewNextAction >= 1 && sessionCount >= 4,
      build: () => ({
        id: makeId(input, 'study-review-action'),
        observation: 'You use review as your next action.',
        evidence: `You chose review ${input.usedReviewNextAction} times as next action.`,
        confidence: input.usedReviewNextAction >= 3 ? 'medium' : 'weak',
        insightCategory: 'study_continuity',
        recommendedAction: 'VEX will prioritize review in your next study block.',
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: 'general',
      condition: () =>
        input.totalFocusMinutes >= 30 && sessionCount >= 2,
      build: () => ({
        id: makeId(input, 'duration'),
        observation: `Your focus sessions average ${Math.round(input.totalFocusMinutes / Math.max(1, input.completedSessions))} minutes.`,
        evidence: `${input.completedSessions} sessions totaling ${input.totalFocusMinutes} minutes of focused work.`,
        confidence: sessionCount >= 5 ? 'medium' : 'weak',
        insightCategory: 'general',
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: 'general',
      condition: () =>
        input.streakDays >= 3 &&
        input.bestSessionDurationMinutes !== undefined &&
        input.bestSessionDurationMinutes >= 20,
      build: () => {
        const best = input.bestSessionDurationMinutes ?? 0;
        return {
          id: makeId(input, 'streak'),
          observation: `Your longest streak is ${input.streakDays} days with a best session of ${best} minutes.`,
          evidence: `Streak of ${input.streakDays} days. Best session: ${best} minutes.`,
          confidence: input.streakDays >= 7 ? 'strong' : 'medium',
          insightCategory: 'general' as const,
          lane: input.lane,
          userVisible: true,
          editedByUser: false,
          deletedByUser: false,
          createdAt: now,
        };
      },
    },
    {
      category: 'general',
      condition: () =>
        input.averageFocusScore !== undefined &&
        input.averageFocusScore >= 70 &&
        sessionCount >= 2,
      build: () => {
        const score = input.averageFocusScore ?? 0;
        return {
          id: makeId(input, 'focus'),
          observation: `Your average focus quality is ${Math.round(score)}%. Sessions hold well.`,
          evidence: `Average focus score of ${Math.round(score)}% across ${sessionCount} sessions.`,
          confidence: sessionCount >= 5 ? 'medium' : 'weak',
          insightCategory: 'general' as const,
          lane: input.lane,
          userVisible: true,
          editedByUser: false,
          deletedByUser: false,
          createdAt: now,
        };
      },
    },
    {
      category: 'general',
      condition: () =>
        input.mostProductiveTimeLabel !== undefined &&
        input.mostProductiveTimeLabel.length > 0 &&
        sessionCount >= 4,
      build: () => {
        const timeLabel = input.mostProductiveTimeLabel ?? '';
        return {
          id: makeId(input, 'time'),
          observation:
            sessionCount < 8
              ? `Sessions have tended toward ${timeLabel}. Still early to call a pattern.`
              : `Your strongest sessions tend to happen ${timeLabel}.`,
          evidence: `Most consistent session quality during ${timeLabel}.`,
          confidence: sessionCount >= 8 ? 'medium' : 'weak',
          insightCategory: 'general' as const,
          lane: input.lane,
          userVisible: true,
          editedByUser: false,
          deletedByUser: false,
          createdAt: now,
        };
      },
    },
    {
      category: 'general',
      condition: () => input.rescueSessionsCompleted >= 1,
      build: () => ({
        id: makeId(input, 'rescue'),
        observation: `You have completed ${input.rescueSessionsCompleted} recovery sessions. You come back effectively.`,
        evidence: `${input.rescueSessionsCompleted} rescue sessions completed.`,
        confidence: input.rescueSessionsCompleted >= 3 ? 'medium' : 'weak',
        insightCategory: 'general',
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
  ];
}
