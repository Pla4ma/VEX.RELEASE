export interface StreakBrokenModalProps {
    /** Visible state */
    visible: boolean;
    /** Broken streak length */
    brokenStreakDays: number;
    /** Previous multiplier that was lost */
    lostMultiplier: number;
    /** User's longest streak (still intact) */
    longestStreak: number;
    /** Comeback bonus available */
    comebackBonus: {
        xpMultiplier: number;
        duration: number; // hours
        };
    /** AI coach message */
    coachMessage: string;
    /** Start fresh session */
    onStartFresh: () => void;
    /** Dismiss modal */
    onDismiss: () => void;
    /**
     * PHASE 5.3: Streak restore purchase
     */
    userId: string;
    /** Restore streak with gems (cost based on streak length) */
    onRestoreStreak?: (costGems: number) => Promise<boolean>;
    /** Current gem balance */
    gemsBalance?: number;
    /** Called when restore is in progress */
    onRestoreStart?: () => void;
}
