import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { Text } from '../../../../components/primitives/Text';
import { etherealButton, etherealText } from '@/theme/tokens/ethereal-sky';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';

import type { MascotMood } from './VexMascotGuide';

export function useMascotFloatAnimation(mood: MascotMood, reducedMotion: boolean) {
  const float = useSharedValue(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.15);

  useEffect(() => {
    if (reducedMotion) {
      float.value = 0;
      scale.value = 1;
      glow.value = 0.2;
      return () => {};
    }

    const floatDuration = mood === 'wave' ? 1800 : mood === 'celebrate' ? 1600 : 2400;
    float.value = withRepeat(
      withTiming(1, { duration: floatDuration, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.985, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(0.28, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.12, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );

    return () => {
      float.value = 0;
      scale.value = 1;
      glow.value = 0.15;
    };
  }, [float, scale, glow, mood, reducedMotion]);

  return { float, scale, glow };
}

export function useMascotGuideAnimatedStyle(
  float: SharedValue<number>,
  scale: SharedValue<number>,
  isReducedMotion: boolean,
) {
  return useAnimatedStyle(() => ({
    transform: [
      { translateY: isReducedMotion ? 0 : -4 * float.value },
      { scale: isReducedMotion ? 1 : scale.value },
    ],
  }));
}

export function GuideAction({
  label,
  onPress,
  strong = false,
}: {
  label: string;
  onPress: () => void;
  strong?: boolean;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityHint={`Activates ${label}`}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        getMinTouchTargetStyle(),
        {
          opacity: pressed ? 0.72 : 1,
          paddingHorizontal: 4,
          justifyContent: 'center',
        },
      ]}
    >
      <Text
        fontSize={12}
        fontWeight="800"
        style={{ color: strong ? etherealButton.emailText : etherealText.heading }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
