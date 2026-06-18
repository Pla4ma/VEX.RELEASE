export interface ComboMeterProps {
  comboMinutes: number;
  isPaused: boolean;
  isIdle: boolean;
  onMilestoneReached?: (milestone: number, multiplier: number) => void;
  onComboBroken?: (finalCombo: number) => void;
}

export type ComboTier =
  | 'NONE'
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'DIAMOND';

export interface ComboTierConfig {
  minCombo: number;
  name: string;
  color: string;
  emoji: string;
  multiplier: number;
  animation: 'pulse' | 'shake' | 'rainbow';
}
