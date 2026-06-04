import { lightColors } from '@/theme/tokens/colors';


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
  { id: 'indigo', hex: lightColors.semantic.primary },
  { id: 'purple', hex: lightColors.accent.purple },
  { id: 'blue', hex: lightColors.accent.blue },
  { id: 'green', hex: lightColors.accent.green },
  { id: 'orange', hex: lightColors.accent.orange },
  { id: 'pink', hex: lightColors.accent.pink },
  { id: 'red', hex: lightColors.semantic.danger },
  { id: 'teal', hex: lightColors.accent.teal },
];

export const TIMER_FORMAT_OPTIONS: TimerFormatOption[] = [
  { id: 'countdown', label: 'Countdown', preview: '24:59' },
  { id: 'countup', label: 'Count Up', preview: '00:01' },
];
