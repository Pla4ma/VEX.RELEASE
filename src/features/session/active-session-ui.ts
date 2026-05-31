import type { ModeSpecificUI } from './types';
import { SessionMode } from '../../session/modes';

export const MODE_SPECIFIC_UI: Partial<Record<SessionMode, ModeSpecificUI>> = {
  [SessionMode.CHALLENGE]: {
    theme: 'dark',
    companionPosition: 'bottom',
    showProgressBar: true,
    showPurityIndicator: true,
    showStreakFlame: true,
    allowMoodLogging: false,
    allowNotes: false,
  },
  [SessionMode.FLOW]: {
    theme: 'light',
    companionPosition: 'bottom',
    showProgressBar: true,
    showPurityIndicator: true,
    showStreakFlame: true,
    allowMoodLogging: true,
    allowNotes: true,
  },
  [SessionMode.RECOVERY]: {
    theme: 'light',
    companionPosition: 'bottom',
    showProgressBar: true,
    showPurityIndicator: false,
    showStreakFlame: false,
    allowMoodLogging: true,
    allowNotes: true,
  },
  [SessionMode.STARTER]: {
    theme: 'light',
    companionPosition: 'bottom',
    showProgressBar: true,
    showPurityIndicator: false,
    showStreakFlame: false,
    allowMoodLogging: false,
    allowNotes: false,
  },
  [SessionMode.CREATIVE]: {
    theme: 'creative',
    companionPosition: 'hidden',
    showProgressBar: false,
    showPurityIndicator: false,
    showStreakFlame: false,
    allowMoodLogging: true,
    allowNotes: true,
  },
};

export function getModeSpecificUI(
  mode: (typeof SessionMode)[keyof typeof SessionMode],
): ModeSpecificUI {
  return MODE_SPECIFIC_UI[mode] ?? MODE_SPECIFIC_UI[SessionMode.FLOW]!;
}
