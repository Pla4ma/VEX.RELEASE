import type { ActiveSessionConfig } from './types';
import { SessionMode } from '../../session/modes';
export { MODE_SPECIFIC_UI, getModeSpecificUI } from './active-session-ui';

export const ACTIVE_SESSION_CONFIG: Partial<
  Record<SessionMode, ActiveSessionConfig>
> = {
  [SessionMode.DEEP_WORK]: {
    mode: SessionMode.DEEP_WORK,
    allowPauses: true,
    maxPauses: 1,
    minFocusSecondsBeforePause: 600,
    pauseCooldownSeconds: 300,
    allowBackground: false,
    maxBackgroundSeconds: 30,
    strictMode: true,
    companionEnabled: true,
    coachEnabled: true,
    coachCooldownSeconds: 900,
  },
  [SessionMode.CHALLENGE]: {
    mode: SessionMode.CHALLENGE,
    allowPauses: true,
    maxPauses: 1,
    minFocusSecondsBeforePause: 600,
    pauseCooldownSeconds: 300,
    allowBackground: false,
    maxBackgroundSeconds: 30,
    strictMode: true,
    companionEnabled: true,
    coachEnabled: true,
    coachCooldownSeconds: 900,
  },
  [SessionMode.FLOW]: {
    mode: SessionMode.FLOW,
    allowPauses: true,
    maxPauses: 5,
    minFocusSecondsBeforePause: 60,
    pauseCooldownSeconds: 60,
    allowBackground: true,
    maxBackgroundSeconds: 300,
    strictMode: false,
    companionEnabled: true,
    coachEnabled: true,
    coachCooldownSeconds: 600,
  },
  [SessionMode.LIGHT_FOCUS]: {
    mode: SessionMode.LIGHT_FOCUS,
    allowPauses: true,
    maxPauses: 5,
    minFocusSecondsBeforePause: 60,
    pauseCooldownSeconds: 60,
    allowBackground: true,
    maxBackgroundSeconds: 300,
    strictMode: false,
    companionEnabled: true,
    coachEnabled: true,
    coachCooldownSeconds: 600,
  },
  [SessionMode.STUDY]: {
    mode: SessionMode.STUDY,
    allowPauses: true,
    maxPauses: 3,
    minFocusSecondsBeforePause: 300,
    pauseCooldownSeconds: 180,
    allowBackground: true,
    maxBackgroundSeconds: 120,
    strictMode: false,
    companionEnabled: true,
    coachEnabled: true,
    coachCooldownSeconds: 600,
  },
  [SessionMode.CREATIVE]: {
    mode: SessionMode.CREATIVE,
    allowPauses: true,
    maxPauses: 10,
    minFocusSecondsBeforePause: 0,
    pauseCooldownSeconds: 0,
    allowBackground: true,
    maxBackgroundSeconds: 600,
    strictMode: false,
    companionEnabled: false,
    coachEnabled: true,
    coachCooldownSeconds: 1200,
  },
  [SessionMode.SPRINT]: {
    mode: SessionMode.SPRINT,
    allowPauses: false,
    maxPauses: 0,
    minFocusSecondsBeforePause: 0,
    pauseCooldownSeconds: 0,
    allowBackground: false,
    maxBackgroundSeconds: 0,
    strictMode: true,
    companionEnabled: true,
    coachEnabled: true,
    coachCooldownSeconds: 300,
  },
  [SessionMode.RECOVERY]: {
    mode: SessionMode.RECOVERY,
    allowPauses: false,
    maxPauses: 0,
    minFocusSecondsBeforePause: 0,
    pauseCooldownSeconds: 0,
    allowBackground: false,
    maxBackgroundSeconds: 0,
    strictMode: true,
    companionEnabled: true,
    coachEnabled: true,
    coachCooldownSeconds: 300,
  },
  [SessionMode.STARTER]: {
    mode: SessionMode.STARTER,
    allowPauses: false,
    maxPauses: 0,
    minFocusSecondsBeforePause: 0,
    pauseCooldownSeconds: 0,
    allowBackground: false,
    maxBackgroundSeconds: 0,
    strictMode: false,
    companionEnabled: true,
    coachEnabled: false,
    coachCooldownSeconds: 0,
  },
};

export function getActiveSessionConfig(
  mode: (typeof SessionMode)[keyof typeof SessionMode],
): ActiveSessionConfig {
  return (
    ACTIVE_SESSION_CONFIG[mode] ?? ACTIVE_SESSION_CONFIG[SessionMode.FLOW]!
  );
}

export function canPause(
  mode: (typeof SessionMode)[keyof typeof SessionMode],
  elapsedSeconds: number,
  pauseCount: number,
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

export function canBackground(
  mode: (typeof SessionMode)[keyof typeof SessionMode],
  backgroundSeconds: number,
): boolean {
  const config = getActiveSessionConfig(mode);
  if (!config.allowBackground) {
    return false;
  }
  return backgroundSeconds < config.maxBackgroundSeconds;
}
