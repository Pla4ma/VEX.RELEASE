import { useMemo } from 'react';
import { formatTime } from './start-session-button-types';

export interface StartSessionButtonText {
  buttonLabel: string;
  subtitleText: string;
  isUrgent: boolean;
  urgencyIcon: string | null;
}

interface StartSessionButtonTextInput {
  label?: string;
  subtitle?: string;
  resumeTimeSeconds?: number | null;
  squadMembersFocusing?: number;
  streakRiskLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  streakHoursRemaining?: number | null;
  hasActiveSession?: boolean;
  isFinalStrike?: boolean;
  bossName?: string;
}

export function useStartSessionButtonText({
  label,
  subtitle,
  resumeTimeSeconds,
  squadMembersFocusing,
  streakRiskLevel,
  streakHoursRemaining,
  hasActiveSession,
  isFinalStrike,
  bossName,
}: StartSessionButtonTextInput): StartSessionButtonText {
  const buttonLabel = useMemo(() => {
    if (label) {return label;}
    if (hasActiveSession) {return 'Resume Session';}
    if (isFinalStrike && bossName) {return `Defeat ${bossName} Now`;}
    return 'Start Focus Session';
  }, [label, hasActiveSession, isFinalStrike, bossName]);

  const subtitleText = useMemo(() => {
    if (subtitle) {return subtitle;}
    if (hasActiveSession && resumeTimeSeconds) {
      return `${formatTime(resumeTimeSeconds)} elapsed`;
    }
    if (isFinalStrike) {
      return 'Final Strike mode — guaranteed defeat this session!';
    }
    if (squadMembersFocusing && squadMembersFocusing > 0) {
      return `${squadMembersFocusing} squad member${squadMembersFocusing > 1 ? 's' : ''} currently focusing`;
    }
    if (streakRiskLevel === 'CRITICAL' && streakHoursRemaining !== null) {
      return `${streakHoursRemaining}h left to save your streak`;
    }
    if (streakRiskLevel === 'HIGH' && streakHoursRemaining !== null) {
      return `${streakHoursRemaining} hours remaining`;
    }
    return 'Tap to begin your focus session';
  }, [
    subtitle,
    hasActiveSession,
    resumeTimeSeconds,
    isFinalStrike,
    squadMembersFocusing,
    streakRiskLevel,
    streakHoursRemaining,
  ]);

  const isUrgent =
    streakRiskLevel === 'CRITICAL' ||
    streakRiskLevel === 'HIGH' ||
    Boolean(isFinalStrike);

  const urgencyIcon = isFinalStrike
    ? 'target'
    : streakRiskLevel === 'CRITICAL'
      ? 'alert'
      : streakRiskLevel === 'HIGH'
        ? 'clock'
        : null;

  return { buttonLabel, subtitleText, isUrgent, urgencyIcon };
}
