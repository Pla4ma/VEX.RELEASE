export interface PremiumBadgeProps {
    size?: "sm" | "md" | "lg";
    variant?: "default" | "subtle" | "animated";
    style?: ViewStyle;
    showGlow?: boolean;
}

export interface SupporterBadgeProps {
    size?: "sm" | "md" | "lg";
    style?: ViewStyle;
}

export interface PremiumXpBonusProps {
    bonus?: number;
    style?: ViewStyle;
}
