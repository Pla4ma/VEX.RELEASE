export interface SessionStake {
    id: string;
    priority: number;
    icon: string;
    title: string;
    subtitle: string;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    accentColor?: string;
}

export interface SessionStakesBriefingProps {
    /** Boss data for stake display */
    bossStake?: {
        bossName: string;
        healthPercent: number;
        estimatedDamage: number;
        wouldDefeat: boolean;
        isFinalStrike: boolean;
        } | null;
    /** Streak data */
    streakStake?: {
        currentDays: number;
        sessionNumberInStreak: number;
        multiplier: number;
        isAtRisk: boolean;
        hoursUntilDeadline: number | null;
        } | null;
    /** Active challenge data */
    challengeStake?: {
        challengeName: string;
        current: number;
        target: number;
        canComplete: boolean;
        } | null;
    /** Rival data */
    rivalStake?: {
        rivalName: string;
        theirMinutes: number;
        myMinutes: number;
        gapMinutes: number;
        } | null;
    /** Squad war data */
    squadWarStake?: {
        hoursRemaining: number;
        squadMinutesNeeded: number;
        myContribution: number;
        } | null;
    /** Callback when user taps a stake for details */
    onStakePress?: (stakeId: string) => void;
}
