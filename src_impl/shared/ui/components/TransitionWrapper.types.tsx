export interface TransitionConfig {
    preset: TransitionPreset;
    duration?: number;
    delay?: number;
    easing?: TransitionEasing;
    springConfig?: {
        damping?: number;
        stiffness?: number;
        mass?: number;
        overshootClamping?: boolean;
        };
}

export interface TransitionWrapperProps {
    children: React.ReactNode;
    visible: boolean;
    enterConfig?: TransitionConfig;
    exitConfig?: TransitionConfig;
    onEnterComplete?: () => void;
    onExitComplete?: () => void;
    style?: ViewStyle;
    maintainLayout?: boolean;
    staggerChildren?: number;
    childDelay?: number;
}

export type TransitionPreset = | 'fade'
      | 'slideRight'
      | 'slideLeft'
      | 'slideUp'
      | 'slideDown'
      | 'zoom'
      | 'flip'
      | 'scale'
      | 'none';
export type TransitionEasing = | 'linear'
      | 'ease'
      | 'easeIn'
      | 'easeOut'
      | 'easeInOut'
      | 'spring'
      | 'bounce';
