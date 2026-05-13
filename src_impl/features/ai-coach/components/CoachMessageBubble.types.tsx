export interface CoachMessageBubbleProps {
    /** Message data */
    message: CoachMessage;
    /** Whether this is a coach message (left) or user message (right) */
    isCoach?: boolean;
    /** Index for stagger animation */
    index?: number;
    /** Callback when action button is pressed */
    onActionPress?: (action: string) => void;
}

/**
 * System message bubble (centered, distinct styling)
 * Used for: milestones, streak alerts, notifications
 */
export interface SystemMessageBubbleProps {
    message: CoachMessage;
    index?: number;
}

/**
 * User message bubble (right-aligned)
 */
export interface UserMessageBubbleProps {
    content: string;
    timestamp: number;
    index?: number;
}
