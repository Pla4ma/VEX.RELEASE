import type { InsightCategory, LearnedItem, WhatVEXLearnedInput } from '../schemas';

export interface InsightBuilder {
  category: InsightCategory;
  condition: () => boolean;
  build: () => LearnedItem;
}

export function makeId(input: WhatVEXLearnedInput, suffix: string): string {
  return `learned:${input.userId}:${suffix}`;
}
