import type { ActiveSessionConfig, ModeSpecificUI } from "./types";
import { SessionMode } from "../../session/modes";


export function getActiveSessionConfig(mode: typeof SessionMode[keyof typeof SessionMode]): ActiveSessionConfig {
  return ACTIVE_SESSION_CONFIG[mode] ?? ACTIVE_SESSION_CONFIG[SessionMode.FLOW]!;
}

export function getModeSpecificUI(mode: typeof SessionMode[keyof typeof SessionMode]): ModeSpecificUI {
  return MODE_SPECIFIC_UI[mode] ?? MODE_SPECIFIC_UI[SessionMode.FLOW]!;
}

export function canPause(
  mode: typeof SessionMode[keyof typeof SessionMode],
  elapsedSeconds: number,
  pauseCount: number
): boolean {
  const config = getActiveSessionConfig(mode);
  if (!config.allowPauses) {
    return false;
  }
  if (pauseCount >= config.maxPauses) {
    return false;
  }
  return elapsedSeconds >= config.minFocusSecondsBeforePause;
}

export function canBackground(mode: typeof SessionMode[keyof typeof SessionMode], backgroundSeconds: number): boolean {
  const config = getActiveSessionConfig(mode);
  if (!config.allowBackground) {
    return false;
  }
  return backgroundSeconds < config.maxBackgroundSeconds;
}