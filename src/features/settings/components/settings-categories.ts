import type { SettingCategory } from '../types';

export const SETTINGS_CATEGORIES: {
  key: SettingCategory;
  label: string;
  icon: string;
}[] = [
  { key: 'general', label: 'General', icon: '\u2699\uFE0F' },
  { key: 'notifications', label: 'Notifications', icon: '\uD83D\uDD14' },
  { key: 'coach', label: 'Coach', icon: '\uD83C\uDFAF' },
  { key: 'appearance', label: 'Appearance', icon: '\uD83C\uDFA8' },
  { key: 'privacy', label: 'Privacy', icon: '\uD83D\uDD12' },
  { key: 'data', label: 'Data', icon: '\uD83D\uDCBE' },
];
