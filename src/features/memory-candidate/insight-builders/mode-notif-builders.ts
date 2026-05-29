import type { InsightCategory, LearnedItem, WhatVEXLearnedInput } from "../schemas";

interface InsightBuilder {
  category: InsightCategory;
  condition: () => boolean;
  build: () => LearnedItem;
}

function makeId(input: WhatVEXLearnedInput, suffix: string): string {
  return `learned:${input.userId}:${suffix}`;
}

export function buildModeNotifInsights(
  input: WhatVEXLearnedInput,
  now: number,
): InsightBuilder[] {
  const sessionCount = input.totalSessions;

  return [
    {
      category: "mode_behavior",
      condition: () => input.modeChanges >= 3 && sessionCount >= 5,
      build: () => ({
        id: makeId(input, "mode-behavior-change"),
        observation: "You switch between modes often.",
        evidence: `Mode changed ${input.modeChanges} times across ${sessionCount} sessions.`,
        confidence: input.modeChanges >= 5 ? "medium" : "weak",
        insightCategory: "mode_behavior",
        recommendedAction: "Pick one mode for the next 3 sessions. Rhythm helps consistency.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: "mode_behavior",
      condition: () =>
        input.prefersModeAfterMissedDays !== undefined && sessionCount >= 4,
      build: () => ({
        id: makeId(input, "mode-behavior-after-miss"),
        observation: `After missed days, you tend to use ${input.prefersModeAfterMissedDays}.`,
        evidence: `Your mode selection shows ${input.prefersModeAfterMissedDays} after gaps.`,
        confidence: "weak",
        insightCategory: "mode_behavior",
        recommendedAction: "VEX will surface this mode first after your next gap.",
        humilityNote: "This is an early pattern. It may change.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: "mode_behavior",
      condition: () =>
        input.hasNamedStudyTargets === true &&
        input.completedNamedStudyTargets >= 2 &&
        sessionCount >= 3,
      build: () => ({
        id: makeId(input, "mode-behavior-named-target"),
        observation: "Named targets improve your study blocks.",
        evidence: `Your completed study sessions all had a named target.`,
        confidence: input.completedNamedStudyTargets >= 4 ? "medium" : "weak",
        insightCategory: "mode_behavior",
        recommendedAction: "Keep naming the target before each study block.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: "mode_behavior",
      condition: () =>
        input.hasSavedNextMoves === true &&
        input.returnedToNextMove >= 1 &&
        sessionCount >= 3,
      build: () => ({
        id: makeId(input, "mode-behavior-next-move"),
        observation: "Saved next moves help you return.",
        evidence: "You returned faster after saving a handoff.",
        confidence: input.returnedToNextMove >= 3 ? "medium" : "weak",
        insightCategory: "mode_behavior",
        recommendedAction: "Save one concrete next move before closing a project session.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: "notification_behavior",
      condition: () =>
        input.eveningNudgeDismissals >= 2 && sessionCount >= 3,
      build: () => ({
        id: makeId(input, "notif-evening"),
        observation: "Evening nudges are not helping.",
        evidence: `You dismissed the last ${input.eveningNudgeDismissals} evening nudges.`,
        confidence: input.eveningNudgeDismissals >= 3 ? "medium" : "weak",
        insightCategory: "notification_behavior",
        recommendedAction: "VEX will pause evening nudges and try a different time.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: "notification_behavior",
      condition: () =>
        input.morningNudgeOpens >= 2 && sessionCount >= 3,
      build: () => ({
        id: makeId(input, "notif-morning"),
        observation: "Morning nudges work for you.",
        evidence: `You opened ${input.morningNudgeOpens} morning nudges.`,
        confidence: input.morningNudgeOpens >= 3 ? "medium" : "weak",
        insightCategory: "notification_behavior",
        recommendedAction: "VEX will prioritize morning check-ins.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: "notification_behavior",
      condition: () =>
        input.genericNudgeIgnores >= 2 && sessionCount >= 3,
      build: () => ({
        id: makeId(input, "notif-generic"),
        observation: "Generic nudges don't get your attention.",
        evidence: `You ignored ${input.genericNudgeIgnores} generic reminders.`,
        confidence: input.genericNudgeIgnores >= 4 ? "medium" : "weak",
        insightCategory: "notification_behavior",
        recommendedAction: "VEX will make nudges more specific to your last session.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
  ];
}
