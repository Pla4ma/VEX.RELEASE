export interface DailyReward {
    day: number;
    type: 'coins' | 'gems' | 'boost' | 'chest';
    amount: number;
    label: string;
    icon: string;
}

export interface DailyLoginModalProps {
    /** Modal visibility */
    visible: boolean;
    /** Current day in streak (1-7) */
    currentDay: number;
    /** Login streak days */
    streakDays: number;
    /** Whether today's reward already claimed */
    isClaimed: boolean;
    /** Claim reward */
    onClaim: () => void;
    /** Dismiss modal */
    onDismiss: () => void;
}
