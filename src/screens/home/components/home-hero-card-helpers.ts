import type { UrgencyLevel } from '../services/HomeRecommendationEngine';
import { lightColors } from '@/theme/tokens/colors';


export function getHeroIcon(type: string): string {
  if (type === 'focus_session') {
    return 'target';
  }
  if (type === 'study_plan') {
    return 'book-open';
  }
  if (type === 'comeback') {
    return 'rotate-ccw';
  }
  if (type === 'protect_streak') {
    return 'shield';
  }
  if (type === 'boss_battle') {
    return 'zap';
  }
  if (type === 'start_streak') {
    return 'flame';
  }
  return 'play';
}

export function getHeroUrgencyColor(
  urgency: UrgencyLevel,
  theme: {
    colors: {
      error: Record<number, string>;
      primary: Record<number, string>;
      warning: Record<number, string>;
    };
  },
): string {
  if (urgency === 'critical') {
    return theme.colors.error[500] ?? lightColors.semantic.danger;
  }
  if (urgency === 'high') {
    return theme.colors.warning[500] ?? lightColors.semantic.warning;
  }
  if (urgency === 'medium') {
    return theme.colors.primary[400] ?? lightColors.semantic.primary;
  }
  return 'transparent';
}

export function getHeroGradientColors(
  urgency: UrgencyLevel,
  type: string,
  theme: {
    colors: {
      error: Record<number, string>;
      primary: Record<number, string>;
      success: Record<number, string>;
      warning: Record<number, string>;
    };
  },
): [string, string] {
  if (urgency === 'critical') {
    return [
      theme.colors.error[500] ?? lightColors.semantic.danger,
      theme.colors.error[700] ?? lightColors.semantic.danger,
    ];
  }
  if (urgency === 'high') {
    return [
      theme.colors.warning[500] ?? lightColors.semantic.warning,
      theme.colors.warning[700] ?? lightColors.semantic.warning,
    ];
  }
  if (urgency === 'medium') {
    return [
      theme.colors.primary[500] ?? lightColors.semantic.primary,
      theme.colors.primary[700] ?? lightColors.semantic.primaryPressed,
    ];
  }
  if (type === 'study_plan') {
    return [
      theme.colors.primary[500] ?? lightColors.semantic.primary,
      theme.colors.primary[600] ?? lightColors.semantic.primary,
    ];
  }
  if (type === 'boss_battle') {
    return [
      theme.colors.primary[600] ?? lightColors.accent.purple,
      theme.colors.primary[700] ?? lightColors.accent.purple,
    ];
  }
  if (type === 'comeback') {
    return [
      theme.colors.success[500] ?? lightColors.accent.green,
      theme.colors.success[700] ?? lightColors.semantic.success,
    ];
  }
  return [
    theme.colors.primary[500] ?? lightColors.semantic.primary,
    theme.colors.primary[700] ?? lightColors.semantic.primaryPressed,
  ];
}
