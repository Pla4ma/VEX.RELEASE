import type { InsightCategory, LearnedItem, WhatVEXLearnedInput } from "../schemas";

interface InsightBuilder {
  category: InsightCategory;
  condition: () => boolean;
  build: () => LearnedItem;
}

function makeId(input: WhatVEXLearnedInput, suffix: string): string {
  return `learned:${input.userId}:${suffix}`;
}

export function buildRescueProjectInsights(
  input: WhatVEXLearnedInput,
  now: number,
): InsightBuilder[] {
  const sessionCount = input.totalSessions;

  return [
    {
      category: "rescue_behavior",
      condition: () =>
        input.rescueAcceptsAfterMiss >= 1 && sessionCount >= 3,
      build: () => ({
        id: makeId(input, "rescue-accept"),
        observation: "You respond to rescue offers after a missed day.",
        evidence: `You accepted rescue ${input.rescueAcceptsAfterMiss} times after missed sessions.`,
        confidence: input.rescueAcceptsAfterMiss >= 2 ? "medium" : "weak",
        insightCategory: "rescue_behavior",
        recommendedAction: "VEX will offer rescue faster after a missed day.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: "rescue_behavior",
      condition: () =>
        input.rescueTinyStartCompletions >= 1 &&
        input.rescueShortCompletions >= 2 &&
        sessionCount >= 3,
      build: () => ({
        id: makeId(input, "rescue-tiny-start"),
        observation: "You finish more often when rescue blocks are short.",
        evidence: `You completed ${input.rescueTinyStartCompletions} tiny rescue starts.`,
        confidence: input.rescueTinyStartCompletions >= 3 ? "medium" : "weak",
        insightCategory: "rescue_behavior",
        recommendedAction: "VEX will keep rescue blocks 5–12 minutes.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: "project_continuity",
      condition: () =>
        (input.savedHandoffs ?? 0) >= 2 &&
        (input.returnedToNextMove ?? 0) >= 1 &&
        sessionCount >= 3,
      build: () => ({
        id: makeId(input, "project-handoff"),
        observation: "Saved project handoffs make it easier to return.",
        evidence: `You've saved ${input.savedHandoffs ?? 0} handoffs and returned to ${input.returnedToNextMove ?? 0} of them.`,
        confidence: (input.returnedToNextMove ?? 0) >= 3 ? "medium" : "weak",
        insightCategory: "project_continuity",
        recommendedAction: "Save one concrete next move before closing project sessions.",
        lane: input.lane,
        userVisible: true,
        editedByUser: false,
        deletedByUser: false,
        createdAt: now,
      }),
    },
    {
      category: "project_continuity",
      condition: () =>
        input.staleProjectDays !== undefined &&
        input.staleProjectDays >= 3 &&
        sessionCount >= 3,
      build: () => {
        const staleDays = input.staleProjectDays ?? 0;
        return {
          id: makeId(input, "project-stale"),
          observation: `Your project thread went quiet for ${staleDays} days.`,
          evidence: `Project was stale for ${staleDays} days.`,
          confidence: staleDays >= 7 ? "medium" : "weak",
          insightCategory: "project_continuity" as const,
          recommendedAction: "Save one small next move. Even a tiny step keeps the thread alive.",
          lane: input.lane,
          userVisible: true,
          editedByUser: false,
          deletedByUser: false,
          createdAt: now,
        };
      },
    },
  ];
}
