export interface StreakRiskStatus {
    userId: string;
    currentDays: number;
    hoursRemaining: number;
    minutesRemaining: number;
    riskLevel: RiskLevel;
    flameHealthPercent: number;
    isAtRisk: boolean;
    isCritical: boolean;
    notificationsSent: string[];
    lastUpdated?: number;
}
