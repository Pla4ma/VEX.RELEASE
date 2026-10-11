import type { SessionGlyphName } from '@/shared/ui/liquid-glass';
import { vexFire } from '@/theme/tokens/vex-fire';


export type SessionDifficulty = 'CASUAL' | 'FOCUSED' | 'DEEP_WORK';

export interface DifficultyOption {
  id: SessionDifficulty;
  glyph: SessionGlyphName;
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
    glyph: 'casual',
    name: 'Casual',
    pauseLimit: 'Unlimited',
    xpMultiplier: '50%',
    description: 'Good for maintenance',
    color: vexFire.copper,
  },
  {
    id: 'FOCUSED',
    glyph: 'focused',
    name: 'Focused',
    pauseLimit: '2 max',
    xpMultiplier: '100%',
    description: 'Standard mode',
    color: vexFire.ember,
  },
  {
    id: 'DEEP_WORK',
    glyph: 'deep',
    name: 'Deep Work',
    pauseLimit: '0 pauses',
    xpMultiplier: '150%',
    description: 'Maximum impact',
    color: vexFire.amber,
  },
];
