import type { WhatVEXLearnedInput } from '../schemas';
import { buildStartSessionInsights } from './start-session-builders';
import { buildModeNotifInsights } from './mode-notif-builders';
import { buildRescueProjectInsights } from './rescue-project-builders';
import { buildStudyGeneralInsights } from './study-general-builders';
import type { InsightBuilder } from './builders-shared';

export type { InsightBuilder } from './builders-shared';
export { makeId } from './builders-shared';

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
