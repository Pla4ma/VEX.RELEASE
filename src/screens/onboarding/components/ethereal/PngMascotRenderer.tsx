import React, { useEffect, useMemo } from 'react';
import { Image, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { AnimatedMascotProps } from './AnimatedMascot';
import { FALLBACK_MASCOT, MOOD_ASSET_MAP } from './VexMascotGuide.tokens';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';

function resolveMoodAsset(mood: AnimatedMascotProps['mood']) {
  return MOOD_ASSET_MAP[mood] ?? FALLBACK_MASCOT;
}

export const PngMascotRenderer = React.memo(function PngMascotRenderer({
  mood,
  size,
  reducedMotion,
  isCelebrating = false,
  reactionKey,
  onReady,
}: AnimatedMascotProps): React.JSX.Element {
  const float = useSharedValue(0);
  const breath = useSharedValue(1);
  const glow = useSharedValue(0.16);
  const nod = useSharedValue(0);
  const sparkle = useSharedValue(0);
  const asset = useMemo(() => resolveMoodAsset(mood), [mood]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

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

  useEffect(() => {
    if (reducedMotion || reactionKey === undefined) {
      return;
    }
    nod.value = withSequence(
      withTiming(1, { duration: 110 }),
      withTiming(0, { duration: 180 }),
    );
    glow.value = withSequence(
      withTiming(0.42, { duration: 120 }),
      withTiming(isCelebrating ? 0.32 : 0.18, { duration: 260 }),
    );
  }, [glow, isCelebrating, nod, reactionKey, reducedMotion]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: reducedMotion ? 0 : -5 * float.value + 3 * nod.value },
      { scale: reducedMotion ? 1 : breath.value },
    ],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.7 }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.16 + glow.value * 0.45,
    transform: [{ scale: 0.82 + glow.value * 0.9 }],
  }));
  const sparkleOneStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + sparkle.value * 0.72,
    transform: [
      { translateY: -8 - sparkle.value * 10 },
      { translateX: 4 + sparkle.value * 8 },
      { scale: 0.7 + sparkle.value * 0.45 },
    ],
  }));
  const sparkleTwoStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + (1 - sparkle.value) * 0.62,
    transform: [
      { translateY: -18 + sparkle.value * 12 },
      { translateX: -10 - sparkle.value * 6 },
      { scale: 0.65 + (1 - sparkle.value) * 0.4 },
    ],
  }));

  return (
    <View style={{ width: size.width, height: size.height, alignItems: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 12,
            width: size.width * 0.86,
            height: size.width * 0.86,
            borderRadius: size.width,
            borderWidth: 1,
            borderColor: vexLightGlass.mint[300],
          },
          ringStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 6,
            width: size.width * 0.9,
            height: size.height * 0.58,
            borderRadius: size.width,
            backgroundColor: vexLightGlass.mint[200],
          },
          glowStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 12,
            top: 18,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: vexLightGlass.mint[300],
          },
          sparkleOneStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 14,
            top: 32,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: vexLightGlass.glass.innerHighlight,
          },
          sparkleTwoStyle,
        ]}
      />
      <Animated.View key={mood} entering={reducedMotion ? undefined : FadeIn.duration(220)} style={mascotStyle}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel={`VEX mascot ${mood}`}
          source={asset}
          style={{ width: size.width, height: size.height, resizeMode: 'contain' }}
        />
      </Animated.View>
    </View>
  );
});
