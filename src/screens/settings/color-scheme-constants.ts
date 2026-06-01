import { launchColors } from '@theme/tokens/launch-colors';

export type AccentColor =
  | 'indigo'
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'pink'
  | 'red'
  | 'teal';

export type TimerFormat = 'countdown' | 'countup';

interface AccentColorOption {
  id: AccentColor;
  hex: string;
}

interface TimerFormatOption {
  id: TimerFormat;
  label: string;
  preview: string;
}

export const ACCENT_COLORS: AccentColorOption[] = [
  { id: 'indigo', hex: launchColors.hex_6366f1 },
  { id: 'purple', hex: launchColors.hex_a855f7 },
  { id: 'blue', hex: launchColors.hex_3b82f6 },
  { id: 'green', hex: launchColors.hex_10b981 },
  { id: 'orange', hex: launchColors.hex_f97316 },
  { id: 'pink', hex: launchColors.hex_ec4899 },
  { id: 'red', hex: launchColors.hex_ef4444 },
  { id: 'teal', hex: launchColors.hex_14b8a6 },
];

export const TIMER_FORMAT_OPTIONS: TimerFormatOption[] = [
  { id: 'countdown', label: 'Countdown', preview: '24:59' },
  { id: 'countup', label: 'Count Up', preview: '00:01' },
];
