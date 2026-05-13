export interface FeedbackEvent {
    type: | 'STREAK_INCREMENT'
        | 'LEVEL_UP'
        | 'BOSS_DEFEAT'
        | 'BOSS_DAMAGE'
        | 'REWARD_EARNED'
        | 'SESSION_COMPLETE'
        | 'SESSION_INTERRUPTED'
        | 'PHASE_CHANGE'
        | 'STREAK_WARNING'
        | 'STREAK_BROKEN';
    intensity: 'LOW' | 'MEDIUM' | 'HIGH';
    metadata?: {
        rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
        amount?: number;
        isNewRecord?: boolean;
        };
}

export interface LoadingState {
    message: string;
    progress?: number;
    tip?: string;
    estimatedTime?: number;
}

export interface ErrorRecovery {
    friendlyMessage: string;
    actionText: string;
    actionType: 'RETRY' | 'GO_BACK' | 'CONTINUE' | 'CONTACT_SUPPORT';
    encouragement: string;
}
