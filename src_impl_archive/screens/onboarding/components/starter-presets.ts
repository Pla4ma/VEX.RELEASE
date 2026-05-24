import { STARTER_PRESETS, type StarterPreset } from './onboarding-flow-data';

export function getStarterPresetsForDisplay(showMoreOptions: boolean): StarterPreset[] {
  if (showMoreOptions) {
    return [...STARTER_PRESETS];
  }

  return STARTER_PRESETS.filter((preset) => preset.id !== 'deep');
}
