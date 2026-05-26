/**
 * Lane-fit feature matrix and session threshold lookup.
 * Extracted from service.ts to keep file under 200 lines.
 */

export const LANE_FEATURE_FIT: Record<string, Record<string, 'strong' | 'medium' | 'weak' | 'blocked'>> = {
  study_os: {
    student: 'strong',
    deep_creative: 'medium',
    game_like: 'weak',
    minimal_normal: 'weak',
  },
  run_board: {
    game_like: 'strong',
    student: 'weak',
    deep_creative: 'weak',
    minimal_normal: 'blocked',
  },
  project_thread: {
    deep_creative: 'strong',
    student: 'medium',
    game_like: 'weak',
    minimal_normal: 'weak',
  },
  today_strip: {
    minimal_normal: 'strong',
    deep_creative: 'medium',
    student: 'medium',
    game_like: 'weak',
  },
  boss_tab: {
    game_like: 'strong',
    student: 'weak',
    deep_creative: 'weak',
    minimal_normal: 'blocked',
  },
  rescue_cta: {
    student: 'strong',
    deep_creative: 'strong',
    game_like: 'medium',
    minimal_normal: 'medium',
  },
};

export const NEVER_UNLOCK: ReadonlySet<string> = new Set([
  'shop',
  'inventory',
  'wagers',
  'battle_pass',
  'premium_currency',
  'streak_insurance',
  'gems_prominent',
  'economy_advanced',
  'economy_basic',
]);

export function resolveLaneFit(featureKey: string, lane?: string): 'strong' | 'medium' | 'weak' | 'blocked' {
  const map = LANE_FEATURE_FIT[featureKey];
  if (!map) return 'medium';
  if (!lane) return 'weak';
  return (map[lane] as 'strong' | 'medium' | 'weak' | 'blocked') ?? 'medium';
}

export function resolveMinSessions(laneFit: 'strong' | 'medium' | 'weak' | 'blocked', lane?: string): number {
  if (laneFit === 'strong') return 1;
  if (laneFit === 'medium') return 3;
  // minimal_normal: fewer unlocks — higher threshold
  if (lane === 'minimal_normal') return 7;
  return 5;
}
