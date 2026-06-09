import type { ExplicitMotivationStyle } from '../schemas';

export interface MotivationOption {
  label: string;
  value: ExplicitMotivationStyle;
}

export const OPTIONS: Array<MotivationOption> = [
  { label: 'Calm', value: 'calm' },
  { label: 'Study-focused', value: 'study_focused' },
  { label: 'Game-like', value: 'game_like' },
  { label: 'Coach-led', value: 'coach_led' },
  { label: 'Intense', value: 'intense' },
];
