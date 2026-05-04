/**
 * Season Narrative Configuration
 *
 * PHASE 14.1 - Compelling season names and themes
 * Each season has a narrative hook that makes it feel special
 *
 * @phase 14.1
 */

import type { SeasonNarrative } from './types';

/**
 * Predefined season narratives that rotate
 */
export const SEASON_NARRATIVES: Record<string, SeasonNarrative> = {
  'void': {
    displayName: 'Season of the Void',
    themeDescription: 'The emptiness between distractions grows stronger. Face the Void Procrastinator and reclaim the silence where deep work thrives.',
    bossTheme: 'Void entities that feed on scattered attention',
    accentColor: '#9400D3',
    communityGoalText: 'Collectively defeat the Void Procrastinator',
    communityGoalTarget: 1_000_000,
  },
  'perfectionist': {
    displayName: "The Perfectionist's Reign",
    themeDescription: 'Perfection is the enemy of done. This season demands completion over polish. Show the Perfectionist that shipped beats perfect.',
    bossTheme: 'Perfectionist bosses who trap you in endless revisions',
    accentColor: '#F59E0B',
    communityGoalText: 'Ship imperfect work together',
    communityGoalTarget: 1_000_000,
  },
  'flame': {
    displayName: 'Season of the Eternal Flame',
    themeDescription: 'The fire of focus burns bright but needs fuel. Keep your streak alive through this trial by fire. The Flame respects only consistency.',
    bossTheme: 'Fire elementals that test your daily commitment',
    accentColor: '#FF4500',
    communityGoalText: 'Maintain the eternal flame of daily focus',
    communityGoalTarget: 1_000_000,
  },
  'doomscroll': {
    displayName: 'The Doomscroller Awakens',
    themeDescription: 'Infinite feeds hunger for your attention. This season pits you against the ultimate distraction: the endless scroll. Break free together.',
    bossTheme: 'Doomscrolling demons that devour time',
    accentColor: '#3B82F6',
    communityGoalText: 'Escape the infinite feed together',
    communityGoalTarget: 1_000_000,
  },
  'burnout': {
    displayName: 'Resilience Rising',
    themeDescription: 'The Burnout Beast has claimed too many. This season is about sustainable focus - building habits that last without breaking you.',
    bossTheme: 'Burnout beasts that test your recovery and rest',
    accentColor: '#22C55E',
    communityGoalText: 'Build sustainable focus habits together',
    communityGoalTarget: 1_000_000,
  },
  'midnight': {
    displayName: 'The Midnight Hour',
    themeDescription: 'When the world sleeps, the Midnight Procrastinator strikes. Master the night hours and turn darkness into your productive ally.',
    bossTheme: 'Night creatures that steal sleep and rest',
    accentColor: '#6366F1',
    communityGoalText: 'Master the productive midnight hours',
    communityGoalTarget: 1_000_000,
  },
  'comparison': {
    displayName: 'The Mirror War',
    themeDescription: 'The Comparison Trap turns every success against you. This season breaks the mirror - your only competition is yesterday.',
    bossTheme: 'Mirror entities that distort self-worth',
    accentColor: '#EC4899',
    communityGoalText: 'Break free from comparison together',
    communityGoalTarget: 1_000_000,
  },
  'monday': {
    displayName: 'Monday Must Fall',
    themeDescription: 'The Monday Demon has ruled for too long. Unite to defeat the dread of starting and make every day feel like Friday.',
    bossTheme: 'Monday demons that feed on startup anxiety',
    accentColor: '#E11D48',
    communityGoalText: 'Defeat the Monday Demon collectively',
    communityGoalTarget: 1_000_000,
  },
};

/**
 * Get narrative for a season based on its theme or generate from season ID
 */
export function getSeasonNarrative(seasonTheme: string | null, seasonId?: string): SeasonNarrative {
  // If theme is explicitly set and exists, use it
  if (seasonTheme && SEASON_NARRATIVES[seasonTheme]) {
    return SEASON_NARRATIVES[seasonTheme];
  }

  // Generate from season ID hash to keep consistent
  const themes = Object.keys(SEASON_NARRATIVES);
  const index = seasonId
    ? seasonId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % themes.length
    : 0;

  return SEASON_NARRATIVES[themes[index]] ?? SEASON_NARRATIVES.void;
}

/**
 * Generate a compelling season name from base name
 */
export function getCompellingSeasonName(baseName: string, theme: string | null): string {
  const narrative = getSeasonNarrative(theme);
  return narrative.displayName;
}

/**
 * Format community goal progress for display
 */
export function formatCommunityGoalProgress(current: number, target: number): string {
  const percent = Math.min(100, Math.round((current / target) * 100));
  const formattedCurrent = current >= 1_000_000
    ? `${(current / 1_000_000).toFixed(1)}M`
    : current >= 1_000
      ? `${(current / 1_000).toFixed(1)}K`
      : current.toString();
  const formattedTarget = target >= 1_000_000
    ? `${(target / 1_000_000).toFixed(1)}M`
    : `${(target / 1_000).toFixed(0)}K`;

  return `${formattedCurrent}/${formattedTarget} (${percent}%)`;
}
