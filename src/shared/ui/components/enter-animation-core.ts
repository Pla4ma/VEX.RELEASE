import {
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  Easing,
} from 'react-native-reanimated';

export type EnterDirection = 'up' | 'down' | 'left' | 'right' | 'fade';
export type EnterSpeed = 'instant' | 'fast' | 'normal' | 'slow';

export const SPEED_CONFIGS: Record<
  EnterSpeed,
  { duration: number; easing: typeof Easing.ease }
> = {
  instant: { duration: 0, easing: Easing.ease },
  fast: { duration: 200, easing: Easing.out(Easing.quad) },
  normal: { duration: 350, easing: Easing.out(Easing.cubic) },
  slow: { duration: 500, easing: Easing.out(Easing.cubic) },
};

export const getEnterAnimation = (
  direction: EnterDirection,
  speed: EnterSpeed,
  delay: number,
  _distance: number,
  reducedMotion: boolean,
) => {
  const config = SPEED_CONFIGS[speed];
  if (reducedMotion || speed === 'instant') {
    return FadeIn.duration(0).delay(0);
  }
  const baseDelay = delay;
  switch (direction) {
    case 'up':
      return FadeInUp.duration(config.duration)
        .delay(baseDelay)
        .easing(config.easing);
    case 'down':
      return FadeInDown.duration(config.duration)
        .delay(baseDelay)
        .easing(config.easing);
    case 'left':
      return FadeInLeft.duration(config.duration)
        .delay(baseDelay)
        .easing(config.easing);
    case 'right':
      return FadeInRight.duration(config.duration)
        .delay(baseDelay)
        .easing(config.easing);
    case 'fade':
    default:
      return FadeIn.duration(config.duration)
        .delay(baseDelay)
        .easing(config.easing);
  }
};
