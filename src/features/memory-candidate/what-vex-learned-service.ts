import { WhatVEXLearnedInputSchema, WhatVEXLearnedSchema } from "./schemas";
import type { LearnedItem, WhatVEXLearned, WhatVEXLearnedInput } from "./schemas";

function buildLearnedItems(
  input: WhatVEXLearnedInput,
): LearnedItem[] {
  const items: LearnedItem[] = [];
  const now = Date.now();

  if (input.totalFocusMinutes >= 30 && input.totalSessions >= 2) {
    items.push({
      id: `learned:${input.userId}:duration`,
      observation: `Your focus sessions average ${Math.round(input.totalFocusMinutes / Math.max(1, input.totalSessions))} minutes.`,
      evidence: `${input.totalSessions} sessions totaling ${input.totalFocusMinutes} minutes of focused work.`,
      confidence: input.totalSessions >= 5 ? "medium" : "weak",
      lane: input.lane,
      userVisible: true,
      editedByUser: false,
      deletedByUser: false,
      createdAt: now,
    });
  }

  if (
    input.streakDays >= 3 &&
    input.bestSessionDurationMinutes &&
    input.bestSessionDurationMinutes >= 20
  ) {
    items.push({
      id: `learned:${input.userId}:streak`,
      observation: `Your longest streak is ${input.streakDays} days with a best session of ${input.bestSessionDurationMinutes} minutes.`,
      evidence: `Streak of ${input.streakDays} days. Best session: ${input.bestSessionDurationMinutes} minutes.`,
      confidence: input.streakDays >= 7 ? "strong" : "medium",
      lane: input.lane,
      userVisible: true,
      editedByUser: false,
      deletedByUser: false,
      createdAt: now,
    });
  }

  if (
    input.averageFocusScore !== undefined &&
    input.averageFocusScore >= 70 &&
    input.totalSessions >= 2
  ) {
    items.push({
      id: `learned:${input.userId}:focus`,
      observation: `Your average focus quality is ${Math.round(input.averageFocusScore)}%. Sessions hold well.`,
      evidence: `Average focus score of ${Math.round(input.averageFocusScore)}% across ${input.totalSessions} sessions.`,
      confidence: input.totalSessions >= 5 ? "medium" : "weak",
      lane: input.lane,
      userVisible: true,
      editedByUser: false,
      deletedByUser: false,
      createdAt: now,
    });
  }

  if (
    input.mostProductiveTimeLabel &&
    input.totalSessions >= 4
  ) {
    items.push({
      id: `learned:${input.userId}:time`,
      observation: input.totalSessions < 8
        ? `Sessions have tended toward ${input.mostProductiveTimeLabel}. Still early to call a pattern.`
        : `Your strongest sessions tend to happen ${input.mostProductiveTimeLabel}.`,
      evidence: `Most consistent session quality during ${input.mostProductiveTimeLabel}.`,
      confidence: input.totalSessions >= 8 ? "medium" : "weak",
      lane: input.lane,
      userVisible: true,
      editedByUser: false,
      deletedByUser: false,
      createdAt: now,
    });
  }

  if (input.rescueSessionsCompleted >= 1) {
    items.push({
      id: `learned:${input.userId}:rescue`,
      observation: `You have completed ${input.rescueSessionsCompleted} recovery sessions. You come back effectively.`,
      evidence: `${input.rescueSessionsCompleted} rescue sessions completed.`,
      confidence: input.rescueSessionsCompleted >= 3 ? "medium" : "weak",
      lane: input.lane,
      userVisible: true,
      editedByUser: false,
      deletedByUser: false,
      createdAt: now,
    });
  }

  return items;
}

function buildDisclaimer(sessionCount: number): string {
  if (sessionCount < 5) {
    return "Still early. These are observations, not conclusions. VEX may be wrong.";
  }
  if (sessionCount < 10) {
    return "Patterns are forming. VEX may still be wrong — you can hide or correct any item below.";
  }
  return "Based on your session data. VEX may still be wrong. Edit or hide anything that does not fit.";
}

export function buildWhatVEXLearned(rawInput: WhatVEXLearnedInput): WhatVEXLearned {
  const input = WhatVEXLearnedInputSchema.parse(rawInput);
  const hasEnoughEvidence = input.totalSessions >= 3;
  const items = hasEnoughEvidence ? buildLearnedItems(input) : [];
  const now = Date.now();

  return WhatVEXLearnedSchema.parse({
    id: `vex-learned:${input.userId}`,
    userId: input.userId,
    totalSessions: input.totalSessions,
    items,
    hasEnoughEvidence,
    disclaimer: hasEnoughEvidence
      ? buildDisclaimer(input.totalSessions)
      : "Not enough session data yet. VEX needs at least 3 completed sessions to share observations.",
    lastUpdated: now,
  });
}

export function shouldShowWhatVEXLearned(input: {
  totalSessions: number;
  lastShownAt: number | null;
}): boolean {
  if (input.totalSessions < 3) return false;
  if (!input.lastShownAt) return true;
  const hoursSinceLastShown =
    (Date.now() - input.lastShownAt) / (1000 * 60 * 60);
  return hoursSinceLastShown >= 24;
}
