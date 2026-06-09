import {
  type MasteryRank,
  MASTERY_RANK_THRESHOLDS,
} from '../types';

export type UnlockableFeature =
  | 'DEEP_WORK'
  | 'NIGHTMARE_MODE'
  | 'MASTERY_DUEL'
  | 'CUSTOM_CHALLENGE'
  | 'BOSS_TIER_3_4'
  | 'BOSS_TIER_5_6';

export const FEATURE_REQUIREMENTS: Record<UnlockableFeature, MasteryRank> = {
  DEEP_WORK: 'ADEPT',
  NIGHTMARE_MODE: 'EXPERT',
  MASTERY_DUEL: 'MASTER',
  CUSTOM_CHALLENGE: 'GRANDMASTER',
  BOSS_TIER_3_4: 'ADEPT',
  BOSS_TIER_5_6: 'EXPERT',
};

export const FEATURE_INFO: Record<
  UnlockableFeature,
  { name: string; description: string; icon: string; benefit: string }
> = {
  DEEP_WORK: {
    name: 'Deep Work Mode',
    description:
      'Ultra-minimalist 45+ minute sessions with maximum boss damage',
    icon: 'brain',
    benefit: '1.5× boss damage multiplier',
  },
  NIGHTMARE_MODE: {
    name: 'Nightmare Mode',
    description: 'Stricter anti-cheat with 2× XP reward for perfection',
    icon: 'flame',
    benefit: '2× XP on all sessions',
  },
  MASTERY_DUEL: {
    name: 'Mastery Duel',
    description: 'Duels scored on technique quality, not just time',
    icon: 'trophy',
    benefit: 'Skill-based rival competition',
  },
  CUSTOM_CHALLENGE: {
    name: 'Custom Challenges',
    description: 'Define your own daily challenges with custom rewards',
    icon: 'edit',
    benefit: 'Personalized progression',
  },
  BOSS_TIER_3_4: {
    name: 'Tier 3-4 Bosses',
    description: 'Access to stronger bosses with better loot',
    icon: 'skull',
    benefit: 'Rare boss drops',
  },
  BOSS_TIER_5_6: {
    name: 'Tier 5-6 Bosses',
    description: 'The ultimate boss challenges await',
    icon: 'crown',
    benefit: 'Legendary boss drops',
  },
};

export const RANK_UNLOCKS: Record<MasteryRank, string[]> = {
  APPRENTICE: ['All base session modes', 'Basic boss encounters'],
  ADEPT: ['DEEP_WORK mode unlocked', 'Advanced boss tier 3-4 access'],
  EXPERT: ['Nightmare Mode sessions (2x XP)', 'Boss tier 5-6 access'],
  MASTER: ['Mastery Duel type', 'Custom challenge creation'],
  GRANDMASTER: ['Exclusive Grandmaster badge', 'Priority support access'],
};

export function getRequiredRank(feature: UnlockableFeature): MasteryRank {
  return FEATURE_REQUIREMENTS[feature];
}

export function isFeatureUnlocked(
  userRank: MasteryRank,
  feature: UnlockableFeature,
): boolean {
  const requiredRank = FEATURE_REQUIREMENTS[feature];
  const ranks: MasteryRank[] = [
    'APPRENTICE',
    'ADEPT',
    'EXPERT',
    'MASTER',
    'GRANDMASTER',
  ];
  return ranks.indexOf(userRank) >= ranks.indexOf(requiredRank);
}

export function getPointsToUnlock(
  feature: UnlockableFeature,
  currentPoints: number,
): number {
  const requiredRank = FEATURE_REQUIREMENTS[feature];
  return Math.max(0, MASTERY_RANK_THRESHOLDS[requiredRank] - currentPoints);
}
