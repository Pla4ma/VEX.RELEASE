/**
 * PNG Mascot Animation Hooks
 *
 * Extracted animation setup logic for PngMascotRenderer.
 */

import { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function useMascotAnimations(
  reducedMotion: boolean,
  isCelebrating: boolean
) {
  const float = useSharedValue(0);
  const breath = useSharedValue(1);
  const glow = useSharedValue(0.16);
  const nod = useSharedValue(0);
  const sparkle = useSharedValue(0);

  // Continuous animations
  useEffect(() => {
    if (reducedMotion) {
      float.value = 0;
      breath.value = 1;
      glow.value = isCelebrating ? 0.3 : 0.18;
      sparkle.value = 0;
      return;
    }

    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 1700, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      false,
    );
    breath.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 1900, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.985, { duration: 1900, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      false,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(isCelebrating ? 0.44 : 0.28, { duration: 1600 }),
        withTiming(isCelebrating ? 0.24 : 0.1, { duration: 1700 }),
      ),
      -1,
      false,
    );
    sparkle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(float);
      cancelAnimation(breath);
      cancelAnimation(glow);
      cancelAnimation(sparkle);
    };
  }, [breath, float, glow, isCelebrating, reducedMotion, sparkle]);

  // Reaction animation (nod on interaction)
  useEffect(() => {
    if (reducedMotion) return;
    nod.value = withSequence(
      withTiming(1, { duration: 110 }),
      withTiming(0, { duration: 180 }),
    );
    glow.value = withSequence(
      withTiming(0.42, { duration: 120 }),
      withTiming(isCelebrating ? 0.32 : 0.18, { duration: 260 }),
    );
  }, [glow, isCelebrating, nod, reducedMotion]);

  return { float, breath, glow, nod, sparkle };
}