/**
 * Streak defense calculation — pure functions.
 *
 * Consumed by useStreakDefense and any other feature that needs
 * streak risk state without importing the streaks feature hook.
 */

const locale = Intl.DateTimeFormat().resolvedOptions().locale;
const streakTimeFormatter = new Intl.DateTimeFormat(locale, {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export interface StreakSummary {
  currentDays: number;
  shieldAvailable: boolean;
  nextDeadline: number | null;
  isAtRisk: boolean;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface StreakDefenseState {
  canFreeze: boolean;
  hasFrozenToday: boolean;
  graceUsesRemaining: number;
  maxGraceUses: number;
  hoursLeft: number | null;
  nextQualifyingWindow: {
    hoursUntilOpen: number;
    timeLabel: string;
  } | null;
  isAtRisk: boolean;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isWeekendMode: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function calculateHoursRemaining(
  nextDeadline: number | null | undefined,
): number | null {
  if (!nextDeadline) {return null;}
  const now = Date.now();
  const diffMs = nextDeadline - now;
  if (diffMs <= 0) {return 0;}
  return Math.floor(diffMs / (1000 * 60 * 60));
}

export function calculateQualifyingWindow(
  hoursRemaining: number | null,
): { hoursUntilOpen: number; timeLabel: string } | null {
  if (hoursRemaining === null || hoursRemaining > 12) {return null;}

  const now = new Date();
  const tomorrow6am = new Date(now);
  tomorrow6am.setDate(tomorrow6am.getDate() + 1);
  tomorrow6am.setHours(6, 0, 0, 0);

  const hoursUntilOpen = Math.floor(
    (tomorrow6am.getTime() - now.getTime()) / (1000 * 60 * 60),
  );

  const timeLabel = streakTimeFormatter.format(tomorrow6am);

  return {
    hoursUntilOpen,
    timeLabel: `${timeLabel} tomorrow`,
  };
}

export function buildStreakDefenseState(
  streakSummary: StreakSummary | null | undefined,
  userId: string | null,
  isLoading: boolean,
  error: Error | null,
): StreakDefenseState {
  if (!streakSummary || !userId) {
    return {
      canFreeze: false,
      hasFrozenToday: false,
      graceUsesRemaining: 0,
      maxGraceUses: 1,
      hoursLeft: null,
      nextQualifyingWindow: null,
      isAtRisk: false,
      riskLevel: 'NONE',
      isWeekendMode: false,
      isLoading,
      error,
    };
  }

  const hoursLeft = calculateHoursRemaining(streakSummary.nextDeadline);
  const isAtRisk = streakSummary.isAtRisk;

  let riskLevel: StreakDefenseState['riskLevel'] = streakSummary.riskLevel;
  if (hoursLeft !== null && riskLevel === 'NONE') {
    if (hoursLeft <= 1) {riskLevel = 'CRITICAL';}
    else if (hoursLeft <= 4) {riskLevel = 'HIGH';}
    else if (hoursLeft <= 8) {riskLevel = 'MEDIUM';}
    else if (hoursLeft < 12) {riskLevel = 'LOW';}
  }

  const canFreeze = streakSummary.currentDays > 0 && streakSummary.shieldAvailable;

  return {
    canFreeze,
    hasFrozenToday: !streakSummary.shieldAvailable && streakSummary.currentDays > 0,
    graceUsesRemaining: streakSummary.shieldAvailable ? 1 : 0,
    maxGraceUses: 1,
    hoursLeft,
    nextQualifyingWindow: calculateQualifyingWindow(hoursLeft),
    isAtRisk,
    riskLevel,
    isWeekendMode: false,
    isLoading,
    error,
  };
}
