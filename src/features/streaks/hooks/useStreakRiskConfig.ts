import type { StreakRiskStatus } from "../streak-risk-monitor";
import type { RiskLevel } from "../schemas-enhanced";
import { calculateStreakRisk } from "../streak-risk-monitor";
import { launchColors } from "@theme/tokens/launch-colors";

export const QUERY_KEYS = {
  riskStatus: (userId: string) => ["streaks", "risk", userId],
  streak: (userId: string) => ["streaks", "data", userId],
};

export const RISK_CHECK_INTERVAL = 60 * 1000;
export const STALE_TIME = 30 * 1000;

export interface UseStreakRiskReturn {
  riskStatus: StreakRiskStatus | null;
  riskLevel: RiskLevel;
  hoursRemaining: number;
  minutesRemaining: number;
  flameHealthPercent: number;
  isAtRisk: boolean;
  isCritical: boolean;
  currentStreak: number;
  isLoading: boolean;
  isChecking: boolean;
  isRefreshing: boolean;
  error: Error | null;
  checkRisk: () => Promise<void>;
  refresh: () => Promise<void>;
  retry: () => void;
  flameColor: string;
  urgencyLabel: string;
  shouldShowWarning: boolean;
  shouldShowCritical: boolean;
  notificationSent: boolean;
}

export function getFlameColor(healthPercent: number): string {
  if (healthPercent > 75) {
    return launchColors.hex_4caf50;
  }
  if (healthPercent > 50) {
    return launchColors.hex_ff9800;
  }
  if (healthPercent > 25) {
    return launchColors.hex_ff5722;
  }
  return launchColors.hex_f44336;
}

export function getUrgencyLabel(riskLevel: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    NONE: "Safe",
    LOW: "Stable",
    MEDIUM: "Warning",
    HIGH: "Urgent",
    CRITICAL: "CRITICAL",
  };
  return labels[riskLevel];
}

export function computeRiskStatus(
  streakData: { currentDays: number } | undefined,
  cachedRiskStatus: StreakRiskStatus | null | undefined,
): StreakRiskStatus | null {
  if (!streakData) {
    return cachedRiskStatus || null;
  }
  const freshRisk = calculateStreakRisk(streakData);
  if (cachedRiskStatus) {
    return {
      ...freshRisk,
      notificationsSent: cachedRiskStatus.notificationsSent,
    };
  }
  return freshRisk;
}
