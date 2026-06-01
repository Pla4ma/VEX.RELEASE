

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
  { id: 'indigo', hex: '#6366f1' },
  { id: 'purple', hex: '#a855f7' },
  { id: 'blue', hex: '#3b82f6' },
  { id: 'green', hex: '#10b981' },
  { id: 'orange', hex: '#f97316' },
  { id: 'pink', hex: '#ec4899' },
  { id: 'red', hex: '#ef4444' },
  { id: 'teal', hex: '#14b8a6' },
];

export const TIMER_FORMAT_OPTIONS: TimerFormatOption[] = [
  { id: 'countdown', label: 'Countdown', preview: '24:59' },
  { id: 'countup', label: 'Count Up', preview: '00:01' },
];
