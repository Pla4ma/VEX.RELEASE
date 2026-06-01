import type { InterventionType } from './intervention-types';
import type { ColorPalette } from '../../../theme/colorTypes';

interface BannerColors {
  bg: string;
  border: string;
  accent: string;
}

const SEVERITY_COLOR_MAP: Record<InterventionType, (colors: ColorPalette) => string> = {
  BURNOUT: (c) => c.warning?.[500] ?? '#ff9800',
  PLATEAU: (c) => c.info?.[500] ?? '#2196f3',
  STREAK_RISK: (c) => c.error?.[500] ?? '#f44336',
  BOSS_FINISH: (c) => c.success?.[500] ?? '#4caf50',
  BOSS_OPPORTUNITY: (c) => c.success?.[500] ?? '#4caf50',
  STUDY_BEHIND: (c) => c.warning?.[500] ?? '#ff9800',
  MOMENTUM_BUILDING: (c) => c.primary?.[500] ?? '#6200ee',
  COMEBACK_READY: (c) => c.primary?.[500] ?? '#6200ee',
  STUDY_PLAN_COMPLETE: (c) => c.success?.[500] ?? '#4caf50',
};

export function getBannerColors(
  type: InterventionType,
  colors: ColorPalette,
): BannerColors {
  const resolveColor = SEVERITY_COLOR_MAP[type] ?? SEVERITY_COLOR_MAP.MOMENTUM_BUILDING;
  const color = resolveColor(colors);
  return { bg: color + '15', border: color, accent: color };
}

const ICON_MAP: Record<InterventionType, string> = {
  BURNOUT: '🔥',
  PLATEAU: '📊',
  STREAK_RISK: '⏰',
  BOSS_FINISH: '⚔️',
  BOSS_OPPORTUNITY: '🎯',
  STUDY_BEHIND: '📚',
  MOMENTUM_BUILDING: '📈',
  COMEBACK_READY: '🔄',
  STUDY_PLAN_COMPLETE: '🏆',
};

export function getIcon(type: InterventionType): string {
  return ICON_MAP[type] ?? '💡';
}

export function isNonDismissable(type: InterventionType, hours?: number): boolean {
  return type === 'STREAK_RISK' && hours !== undefined && hours < 4;
}
