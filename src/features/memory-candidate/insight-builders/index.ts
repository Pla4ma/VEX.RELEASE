import type { InsightCategory, LearnedItem, WhatVEXLearnedInput } from "../schemas";
import { buildStartSessionInsights } from "./start-session-builders";
import { buildModeNotifInsights } from "./mode-notif-builders";
import { buildRescueProjectInsights } from "./rescue-project-builders";
import { buildStudyGeneralInsights } from "./study-general-builders";

export interface InsightBuilder {
  category: InsightCategory;
  condition: () => boolean;
  build: () => LearnedItem;
}

export function buildInsightBuilders(
  input: WhatVEXLearnedInput,
  now: number,
): InsightBuilder[] {
  return [
    ...buildStartSessionInsights(input, now),
    ...buildModeNotifInsights(input, now),
    ...buildRescueProjectInsights(input, now),
    ...buildStudyGeneralInsights(input, now),
  ];
}
