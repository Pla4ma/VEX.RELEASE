import type { InterventionType } from './intervention-types';
import type { ColorPalette } from '../../../theme/colorTypes';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface BannerColors {
  bg: string;
  border: string;
  accent: string;
}

const SEVERITY_COLOR_MAP: Record<InterventionType, string> = {
  BURNOUT: vexLightGlass.semantic.warning,
  PLATEAU: '#54AEEA',
  STREAK_RISK: vexLightGlass.semantic.danger,
  BOSS_FINISH: vexLightGlass.semantic.success,
  BOSS_OPPORTUNITY: vexLightGlass.semantic.success,
  STUDY_BEHIND: vexLightGlass.semantic.warning,
  MOMENTUM_BUILDING: '#8B5CF6',
  COMEBACK_READY: '#8B5CF6',
  STUDY_PLAN_COMPLETE: vexLightGlass.semantic.success,
};

export function getBannerColors(
  type: InterventionType,
  _colors: ColorPalette,
): BannerColors {
  const color = SEVERITY_COLOR_MAP[type] ?? SEVERITY_COLOR_MAP.MOMENTUM_BUILDING;
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
