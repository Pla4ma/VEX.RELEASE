import type { ChallengeCategory } from './schemas';

const ECONOMY_CATEGORIES: ReadonlySet<ChallengeCategory> = new Set<ChallengeCategory>([
  'SHOP_PURCHASE',
]);

export function isEconomyCategory(category: ChallengeCategory): boolean {
  return ECONOMY_CATEGORIES.has(category);
}

export function isBehaviorCategory(category: ChallengeCategory): boolean {
  return !ECONOMY_CATEGORIES.has(category);
}

export function filterBehaviorCategories(
  categories: ChallengeCategory[],
): ChallengeCategory[] {
  return categories.filter((c) => !ECONOMY_CATEGORIES.has(c));
}
