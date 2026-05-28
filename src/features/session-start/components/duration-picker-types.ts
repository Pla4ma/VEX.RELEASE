export type DurationPreset = 15 | 25 | 45 | 60 | 90;

export interface DurationPickerProps {
  selectedDuration: number;
  onDurationChange: (minutes: number) => void;
  streakMultiplier?: number;
  xpPerMinute?: number;
  isStrictMode?: boolean;
  isLoading?: boolean;
}

export const PRESETS: DurationPreset[] = [15, 25, 45, 60, 90];

export function calculateEstimatedXp(
  minutes: number,
  xpPerMinute: number,
  streakMultiplier: number,
  isStrictMode: boolean,
): number {
  const baseXp = minutes * xpPerMinute;
  const withStreak = baseXp * streakMultiplier;
  const withStrict = isStrictMode ? withStreak * 1.2 : withStreak;
  return Math.floor(withStrict);
}
