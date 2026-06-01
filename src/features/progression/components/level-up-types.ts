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
    return ['#FFD700', '#FF6B35'];
  }
  if (level >= 50) {
    return ['#9C27B0', '#E91E63'];
  }
  if (level >= 25) {
    return ['#2196F3', '#03A9F4'];
  }
  if (level >= 10) {
    return ['#4CAF50', '#8BC34A'];
  }
  return ['#FF9800', '#FFC107'];
}
