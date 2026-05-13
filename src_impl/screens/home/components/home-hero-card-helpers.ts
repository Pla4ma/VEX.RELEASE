import type { UrgencyLevel } from '../services/HomeRecommendationEngine';

export function getHeroIcon(type: string): string {
  if (type === 'focus_session') { return 'target'; }
  if (type === 'study_plan') { return 'book-open'; }
  if (type === 'comeback') { return 'rotate-ccw'; }
  if (type === 'protect_streak') { return 'shield'; }
  if (type === 'boss_battle') { return 'zap'; }
  if (type === 'start_streak') { return 'flame'; }
  return 'play';
}

export function getHeroUrgencyColor(urgency: UrgencyLevel, theme: { colors: { primary: Record<number, string> } }): string {
  if (urgency === 'critical') { return 'theme.colors.primary[500]'; }
  if (urgency === 'high') { return 'theme.colors.primary[500]'; }
  if (urgency === 'medium') { return theme.colors.primary[400] ?? 'theme.colors.primary[500]'; }
  return 'transparent';
}

export function getHeroGradientColors(
  urgency: UrgencyLevel,
  type: string,
  theme: { colors: { primary: Record<number, string> } }
): [string, string] {
  if (urgency === 'critical') { return ['theme.colors.primary[500]', 'theme.colors.primary[500]']; }
  if (urgency === 'high') { return ['theme.colors.primary[500]', 'theme.colors.primary[500]']; }
  if (urgency === 'medium') { return [theme.colors.primary[500] ?? 'theme.colors.primary[500]', theme.colors.primary[700] ?? 'theme.colors.primary[500]']; }
  if (type === 'study_plan') { return ['theme.colors.primary[500]', 'theme.colors.primary[500]']; }
  if (type === 'boss_battle') { return ['theme.colors.primary[500]', 'theme.colors.primary[500]']; }
  if (type === 'comeback') { return ['theme.colors.primary[500]', 'theme.colors.primary[500]']; }
  return [theme.colors.primary[500] ?? 'theme.colors.primary[500]', theme.colors.primary[700] ?? 'theme.colors.primary[500]'];
}
