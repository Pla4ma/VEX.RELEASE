export { DifficultySelector as ModeSelector } from './DifficultySelector';
export type ModeSelectorProps = {
  disabled?: boolean;
  onChange: (mode: SessionMode) => void;
  selected: SessionMode;
};
export type SessionMode = 'focus' | 'study' | 'challenge' | 'flow';
