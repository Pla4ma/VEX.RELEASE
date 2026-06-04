import { lightColors } from '@/theme/tokens/colors';


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
    color: lightColors.semantic.success,
  },
  {
    id: 'FOCUSED',
    icon: '⚡',
    name: 'Focused',
    pauseLimit: '2 max',
    xpMultiplier: '100%',
    description: 'Standard mode',
    color: lightColors.accent.blue,
  },
  {
    id: 'DEEP_WORK',
    icon: '🔥',
    name: 'Deep Work',
    pauseLimit: '0 pauses',
    xpMultiplier: '150%',
    description: 'Maximum impact',
    color: lightColors.semantic.danger,
  },
];
