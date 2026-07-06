import { SessionMode, resolveSessionMode } from '../../../session/modes';
import { PRESETS, type PresetWithIcon } from '../utils/session-setup';
import type { SessionStackParams } from '../../../navigation/types';

type SessionSetupParams = SessionStackParams['SessionSetup'];

export function resolveInitialPreset(params: SessionSetupParams | undefined): PresetWithIcon {
  if (params?.presetId) {
    return (
      PRESETS.find((preset) => preset.id === params.presetId) ?? PRESETS[1]!
    );
  }
  return PRESETS[1]!;
}

export function resolveInitialDuration(params: SessionSetupParams | undefined): number {
  return params?.presetDuration
    ? Math.max(1, Math.round(params.presetDuration / 60))
    : 30;
}

export function resolveInitialSessionMode(params: SessionSetupParams | undefined): SessionMode {
  return params?.presetMode
    ? resolveSessionMode(params.presetMode)
    : params?.source === 'content-study'
      ? SessionMode.STUDY
      : SessionMode.LIGHT_FOCUS;
}
