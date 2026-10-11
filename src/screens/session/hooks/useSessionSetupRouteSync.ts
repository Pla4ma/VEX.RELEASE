import { useEffect } from 'react';
import type { SessionStackParams } from '../../../navigation/types';
import { SessionMode, resolveSessionMode } from '../../../session/modes';
import { PRESETS, type PresetWithIcon } from '../utils/session-setup';

type SessionSetupParams = SessionStackParams['SessionSetup'];

export function useSessionSetupRouteSync(
  params: SessionSetupParams | undefined,
  setCustomDuration: (value: number) => void,
  setDraftGoal: (value: string | undefined) => void,
  setSelectedCategory: (value: string) => void,
  setSelectedPreset: (value: PresetWithIcon) => void,
  setSelectedSessionMode: (value: SessionMode) => void,
  setSelectedThemeId: (value: string) => void,
): void {
  useEffect(() => {
    if (params?.presetId) {
      const matchedPreset = PRESETS.find(
        (preset) => preset.id === params.presetId,
      );
      if (matchedPreset) {
        setSelectedPreset(matchedPreset);
        setSelectedCategory(matchedPreset.category ?? 'standard');
      }
    }
    if (params?.selectedThemeId) {
      setSelectedThemeId(params.selectedThemeId);
    }
    if (params?.goal) {
      setDraftGoal(params.goal);
    }
    const routedDurationSeconds =
      params?.presetDuration ?? params?.suggestedDurationSeconds;
    if (routedDurationSeconds) {
      setSelectedPreset(PRESETS[5]!);
      setSelectedCategory('custom');
      setCustomDuration(Math.max(1, Math.round(routedDurationSeconds / 60)));
    }
    if (params?.presetMode) {
      setSelectedSessionMode(resolveSessionMode(params.presetMode));
    }
  }, [
    params?.goal,
    params?.presetDuration,
    params?.presetId,
    params?.presetMode,
    params?.selectedThemeId,
    params?.suggestedDurationSeconds,
    setCustomDuration,
    setDraftGoal,
    setSelectedCategory,
    setSelectedPreset,
    setSelectedSessionMode,
    setSelectedThemeId,
  ]);
}
