export interface MotionPreferences {
    /** User prefers reduced motion */
    reducedMotion: boolean;
    /** Animation duration multiplier */
    animationDurationMultiplier: number;
    /** Parallax effects enabled */
    parallaxEnabled: boolean;
    /** Spring animations enabled */
    springAnimationsEnabled: boolean;
    /** Transition animations enabled */
    transitionAnimationsEnabled: boolean;
    /** Haptic feedback enabled */
    hapticFeedbackEnabled: boolean;
}

export interface AnimationConfig {
    type: AnimationType;
    duration: number;
    delay?: number;
    easing?: EasingFunction;
    useNativeDriver?: boolean;
    reducedMotionAlternative?: 'fade' | 'none' | 'instant';
}

export type AnimationType = | 'fade'
      | 'slide'
      | 'scale'
      | 'rotate'
      | 'spring'
      | 'parallax'
      | 'transition';
