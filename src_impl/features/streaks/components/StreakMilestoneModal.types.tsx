export interface StreakMilestoneModalProps {
    /** Modal visibility */
    visible: boolean;
    /** Milestone day */
    milestone: number;
    /** Rewards granted */
    rewards: {
        coins: number;
        gems?: number;
        exclusiveItem?: string;
        };
    /** Dismiss modal */
    onDismiss: () => void;
    /** Share milestone */
    onShare?: () => void;
}
