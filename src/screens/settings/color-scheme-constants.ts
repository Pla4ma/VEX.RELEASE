import { vexFire } from "@/theme/tokens/vex-fire";



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
  { id: 'indigo', hex: vexFire.ember },
  { id: 'purple', hex: vexFire.copper },
  { id: 'blue', hex: vexFire.amber },
  { id: 'green', hex: vexFire.success },
  { id: 'orange', hex: vexFire.ember },
  { id: 'pink', hex: vexFire.copper },
  { id: 'red', hex: vexFire.danger },
  { id: 'teal', hex: vexFire.amber },
];

export const TIMER_FORMAT_OPTIONS: TimerFormatOption[] = [
  { id: 'countdown', label: 'Countdown', preview: '24:59' },
  { id: 'countup', label: 'Count Up', preview: '00:01' },
];
