import type { ActiveSessionConfig } from './types';
import { SessionMode } from '../../session/modes';

const sessionLessModes: Record<string, ActiveSessionConfig> = {
  [SessionMode.PLAN]: {
    mode: SessionMode.PLAN,
    allowPauses: false,
    maxPauses: 0,
    minFocusSecondsBeforePause: 0,
    pauseCooldownSeconds: 0,
    allowBackground: true,
    maxBackgroundSeconds: 0,
    strictMode: false,
    companionEnabled: false,
    coachEnabled: false,
    coachCooldownSeconds: 0,
  },
  [SessionMode.REVIEW]: {
    mode: SessionMode.REVIEW,
    allowPauses: false,
    maxPauses: 0,
    minFocusSecondsBeforePause: 0,
    pauseCooldownSeconds: 0,
    allowBackground: true,
    maxBackgroundSeconds: 0,
    strictMode: false,
    companionEnabled: false,
    coachEnabled: false,
    coachCooldownSeconds: 0,
  },
  [SessionMode.CAPTURE]: {
    mode: SessionMode.CAPTURE,
    allowPauses: false,
    maxPauses: 0,
    minFocusSecondsBeforePause: 0,
    pauseCooldownSeconds: 0,
    allowBackground: true,
    maxBackgroundSeconds: 0,
    strictMode: false,
    companionEnabled: false,
    coachEnabled: false,
    coachCooldownSeconds: 0,
  },
  [SessionMode.HABIT]: {
    mode: SessionMode.HABIT,
    allowPauses: false,
    maxPauses: 0,
    minFocusSecondsBeforePause: 0,
    pauseCooldownSeconds: 0,
    allowBackground: true,
    maxBackgroundSeconds: 0,
    strictMode: false,
    companionEnabled: true,
    coachEnabled: false,
    coachCooldownSeconds: 0,
  },
};

export { sessionLessModes }