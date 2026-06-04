import type { InterventionType } from './intervention-types';
import type { ColorPalette } from '../../../theme/colorTypes';
import { lightColors } from '@/theme/tokens/colors';

interface BannerColors {
  bg: string;
  border: string;
  accent: string;
}

const SEVERITY_COLOR_MAP: Record<InterventionType, (colors: ColorPalette) => string> = {
  BURNOUT: (c) => c.warning?.[500] ?? lightColors.semantic.warning,
  PLATEAU: (c) => c.info?.[500] ?? lightColors.accent.blue,
  STREAK_RISK: (c) => c.error?.[500] ?? lightColors.semantic.danger,
  BOSS_FINISH: (c) => c.success?.[500] ?? lightColors.semantic.success,
  BOSS_OPPORTUNITY: (c) => c.success?.[500] ?? lightColors.semantic.success,
  STUDY_BEHIND: (c) => c.warning?.[500] ?? lightColors.semantic.warning,
  MOMENTUM_BUILDING: (c) => c.primary?.[500] ?? lightColors.accent.purple,
  COMEBACK_READY: (c) => c.primary?.[500] ?? lightColors.accent.purple,
  STUDY_PLAN_COMPLETE: (c) => c.success?.[500] ?? lightColors.semantic.success,
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
  BURNOUT: '',
  PLATEAU: '',
  STREAK_RISK: '',
  BOSS_FINISH: '',
  BOSS_OPPORTUNITY: '',
  STUDY_BEHIND: '',
  MOMENTUM_BUILDING: '',
  COMEBACK_READY: '',
  STUDY_PLAN_COMPLETE: '',
};

export function getIcon(type: InterventionType): string {
  return ICON_MAP[type] ?? '';
}

export function isNonDismissable(type: InterventionType, hours?: number): boolean {
  return type === 'STREAK_RISK' && hours !== undefined && hours < 4;
}
