export interface AnimatedCounterProps {
    value: number;
    previousValue?: number;
    variant?: CounterVariant;
    currency?: 'coins' | 'gems' | 'xp' | string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    size?: CounterSize;
    color?: string;
    increaseColor?: string;
    decreaseColor?: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
    duration?: number;
    useSpring?: boolean;
    springConfig?: {
        damping?: number;
        stiffness?: number;
        };
    animateOnMount?: boolean;
    showTrendIndicator?: boolean;
    compactThreshold?: number;
    locale?: string;
}

export type CounterSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
export type CounterVariant = 'default' | 'currency' | 'percentage' | 'compact';
