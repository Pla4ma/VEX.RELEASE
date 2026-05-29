import { WhatVEXLearnedInputSchema, WhatVEXLearnedSchema } from "./schemas";
import type { LearnedItem, WhatVEXLearned, WhatVEXLearnedInput } from "./schemas";
import { buildInsightBuilders } from "./insight-builders";

function buildLearnedItems(input: WhatVEXLearnedInput): LearnedItem[] {
  const now = Date.now();
  if (input.totalSessions < 3) return [];

  const builders = buildInsightBuilders(input, now);

  const prioritized = builders
    .filter((b) => b.condition())
    .map((b) => b.build())
    .sort((a, b) => {
      const aScore =
        (a.insightCategory !== "general" ? 10 : 0) +
        (a.confidence === "strong" ? 3 : a.confidence === "medium" ? 2 : 1);
      const bScore =
        (b.insightCategory !== "general" ? 10 : 0) +
        (b.confidence === "strong" ? 3 : b.confidence === "medium" ? 2 : 1);
      return bScore - aScore;
    });

  return prioritized.slice(0, 5);
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

export function buildWhatVEXLearned(
  rawInput: WhatVEXLearnedInput,
): WhatVEXLearned {
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
