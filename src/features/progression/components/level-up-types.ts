import { launchColors } from '@theme/tokens/launch-colors';

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
    return '🏆 GRAND MASTER';
  }
  if (level >= 50) {
    return '🌟 MASTER';
  }
  if (level >= 25) {
    return '⭐ EXPERT';
  }
  if (level >= 10) {
    return '💫 ADEPT';
  }
  if (level >= 5) {
    return '✨ APPRENTICE';
  }
  return '🌱 NOVICE';
}

export function getTierColor(level: number): [string, string] {
  if (level >= 100) {
    return [launchColors.hex_ffd700, launchColors.hex_ff6b35];
  }
  if (level >= 50) {
    return [launchColors.hex_9c27b0, launchColors.hex_e91e63];
  }
  if (level >= 25) {
    return [launchColors.hex_2196f3, launchColors.hex_03a9f4];
  }
  if (level >= 10) {
    return [launchColors.hex_4caf50, launchColors.hex_8bc34a];
  }
  return [launchColors.hex_ff9800, launchColors.hex_ffc107];
}
