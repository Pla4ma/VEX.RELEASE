import { lightColors } from '@/theme/tokens/colors';
export interface LevelUpOverlayProps {
  isVisible: boolean;
  previousLevel: number;
  newLevel: number;
  rewards: Array<{ type: string; amount: number; itemName?: string }>;
  unlocks: string[];
  onContinue: () => void;
}

export interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
}

export function getTierTitle(level: number): string {
  if (level >= 100) {
    return 'GRAND MASTER';
  }
  if (level >= 50) {
    return 'MASTER';
  }
  if (level >= 25) {
    return 'EXPERT';
  }
  if (level >= 10) {
    return 'ADEPT';
  }
  if (level >= 5) {
    return 'APPRENTICE';
  }
  return 'NOVICE';
}

export function getTierColor(level: number): [string, string] {
  if (level >= 100) {
    return [lightColors.semantic.vexGold, lightColors.semantic.warning];
  }
  if (level >= 50) {
    return [lightColors.accent.purple, lightColors.accent.pink];
  }
  if (level >= 25) {
    return [lightColors.accent.blue, lightColors.accent.blue];
  }
  if (level >= 10) {
    return [lightColors.semantic.success, lightColors.semantic.success];
  }
  return [lightColors.semantic.warning, lightColors.semantic.warning];
}
