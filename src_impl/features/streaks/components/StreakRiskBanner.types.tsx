export interface StreakRiskBannerProps {
    /** Current risk level */
    riskLevel: StreakRiskLevel;
    /** Hours remaining until streak breaks */
    hoursRemaining: number;
    /** Current streak days */
    streakDays: number;
    /** Suggested duration for session (pre-fill) */
    suggestedDuration: number;
    /** Navigate to session start */
    onStartSession: (duration: number) => void;
}

export type StreakRiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
