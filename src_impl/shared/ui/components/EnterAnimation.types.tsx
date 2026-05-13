export interface EnterAnimationProps {
    children: React.ReactNode;
    direction?: EnterDirection;
    speed?: EnterSpeed;
    delay?: number;
    distance?: number;
    style?: ViewStyle;
    enabled?: boolean;
}

export interface StaggeredEnterProps {
    children: React.ReactNode[];
    direction?: EnterDirection;
    speed?: EnterSpeed;
    staggerDelay?: number;
    initialDelay?: number;
    distance?: number;
    containerStyle?: ViewStyle;
}

export interface CardEnterAnimationProps {
    children: React.ReactNode;
    index?: number;
    total?: number;
    style?: ViewStyle;
}

export type EnterDirection = 'up' | 'down' | 'left' | 'right' | 'fade';
export type EnterSpeed = 'instant' | 'fast' | 'normal' | 'slow';
