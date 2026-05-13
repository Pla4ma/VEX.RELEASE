export interface MicroRewardBannerProps {
    type: RewardType;
    amount?: number;
    label?: string;
    description?: string;
    icon?: string;
    onPress?: () => void;
    onDismiss?: () => void;
    autoDismiss?: boolean;
    autoDismissDelay?: number;
    style?: ViewStyle;
    showOnce?: boolean;
}

export interface CompactRewardBadgeProps {
    /** Type of reward */
    type: RewardType;
    /** Amount to display */
    amount: number;
    /** Custom styles */
    style?: ViewStyle;
}

export type RewardType = 'xp' | 'coins' | 'gems' | 'streak' | 'level' | 'achievement' | 'milestone';
