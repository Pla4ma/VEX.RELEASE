import { useCallback } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from "react-native-reanimated";
import type { EvolutionPhase } from "./companion-evolution-types";
import { delay } from "./companion-evolution-types";

export function useCeremonyAnimation() {
  const glowOpacity = useSharedValue(0.3);
  const glowScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const oldFormOpacity = useSharedValue(1);
  const oldFormScale = useSharedValue(1);
  const newFormOpacity = useSharedValue(0);
  const newFormScale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.8);
  const particleBurst = useSharedValue(0);

  const runCeremony = useCallback(
    async (setPhase: (phase: EvolutionPhase) => void) => {
      setPhase("energy-buildup");
      glowOpacity.value = withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.sin),
      });
      glowScale.value = withTiming(2, {
        duration: 1000,
        easing: Easing.inOut(Easing.sin),
      });
      await delay(1000);

      setPhase("flash");
      flashOpacity.value = withTiming(1, { duration: 250 });
      oldFormOpacity.value = withTiming(0, { duration: 250 });
      await delay(250);
      flashOpacity.value = withTiming(0, { duration: 250 });
      await delay(250);

      setPhase("transformation");
      newFormOpacity.value = withTiming(1, { duration: 1000 });
      newFormScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      particleBurst.value = withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.exp),
      });
      await delay(2000);

      setPhase("celebration");
      textOpacity.value = withTiming(1, { duration: 500 });
      textScale.value = withSpring(1, { damping: 10, stiffness: 200 });
      await delay(1000);

      setPhase("complete");
    },
    [
      flashOpacity,
      glowOpacity,
      glowScale,
      newFormOpacity,
      newFormScale,
      oldFormOpacity,
      particleBurst,
      textOpacity,
      textScale,
    ],
  );

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));
  const oldFormStyle = useAnimatedStyle(() => ({
    opacity: oldFormOpacity.value,
    transform: [{ scale: oldFormScale.value }],
  }));
  const newFormStyle = useAnimatedStyle(() => ({
    opacity: newFormOpacity.value,
    transform: [{ scale: newFormScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));
  const particleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(particleBurst.value, [0, 0.3, 1], [1, 1, 0]),
    transform: [
      { scale: interpolate(particleBurst.value, [0, 1], [0.5, 3]) },
      { rotate: `${particleBurst.value * 360}deg` },
    ],
  }));

  return {
    runCeremony,
    styles: {
      glowStyle,
      flashStyle,
      oldFormStyle,
      newFormStyle,
      textStyle,
      particleStyle,
    },
  };
}
