import { useEffect } from 'react';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export function useAmbientAnimations(isReducedMotion: boolean): {
  pulsePhase: import('react-native-reanimated').SharedValue<number>;
  particlePhase: import('react-native-reanimated').SharedValue<number>;
} {
  const pulsePhase = useSharedValue(0);
  const particlePhase = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {
      pulsePhase.value = 0;
      particlePhase.value = 0;
      return;
    }
    pulsePhase.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    particlePhase.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [isReducedMotion, particlePhase, pulsePhase]);

  return { pulsePhase, particlePhase };
}
