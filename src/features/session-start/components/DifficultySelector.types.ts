import { launchColors } from '@theme/tokens/launch-colors';

export type SessionDifficulty = 'CASUAL' | 'FOCUSED' | 'DEEP_WORK';

export interface DifficultyOption {
  id: SessionDifficulty;
  icon: string;
  name: string;
  pauseLimit: string;
  xpMultiplier: string;
  description: string;
  color: string;
}

export interface DifficultySelectorProps {
  selected: SessionDifficulty;
  onChange: (difficulty: SessionDifficulty) => void;
  disabled?: boolean;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: 'CASUAL',
    icon: '🌿',
    name: 'Casual',
    pauseLimit: 'Unlimited',
    xpMultiplier: '50%',
    description: 'Good for maintenance',
    color: launchColors.hex_22c55e,
  },
  {
    id: 'FOCUSED',
    icon: '⚡',
    name: 'Focused',
    pauseLimit: '2 max',
    xpMultiplier: '100%',
    description: 'Standard mode',
    color: launchColors.hex_3b82f6,
  },
  {
    id: 'DEEP_WORK',
    icon: '🔥',
    name: 'Deep Work',
    pauseLimit: '0 pauses',
    xpMultiplier: '150%',
    description: 'Maximum impact',
    color: launchColors.hex_ef4444,
  },
];
