export interface SkeletonItemProps {
    variant?: SkeletonVariant;
    width?: DimensionValue;
    height?: number;
    circle?: boolean;
    style?: ViewStyle;
}

export interface SkeletonLayoutProps {
    type: 'card' | 'list' | 'hero' | 'stats' | 'text-block';
    count?: number;
    style?: ViewStyle;
}

export type SkeletonVariant = 'text' | 'title' | 'avatar' | 'card' | 'circle' | 'button';
export type SkeletonSize = 'sm' | 'md' | 'lg' | 'full';
