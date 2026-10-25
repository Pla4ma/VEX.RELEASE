export type ToggleKey = 'analytics';

export const TOGGLE_ROWS: {
  key: ToggleKey;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    key: 'analytics',
    title: 'Anonymous Analytics',
    description: 'Share anonymous usage patterns to help improve VEX.',
    icon: 'bar-chart-2',
  },
];
