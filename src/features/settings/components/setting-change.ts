import type { SettingCategory, SettingValue } from '../types';

export type SettingChangeHandler = (
  key: string,
  value: SettingValue,
  category: SettingCategory,
) => void;
