import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { springPresets, motionStagger } from '../../../theme/tokens/motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { lightColors } from '@/theme/tokens/colors';

const EASE_CINEMATIC = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_EDITORIAL = Easing.bezier(0.22, 1, 0.36, 1);

const SERIF_STACK = 'Georgia, "Times New Roman", serif';

/**
 * A single serif letter with a layered ambient glow and a variable-weight
 * entrance (fontWeight tweens 300 → 600 over 1.4s).
 */
export function VexLetter({
  char,
  index,
  isReducedMotion,
}: {
  char: string;
  index: number;
  isReducedMotion: boolean;
}): React.JSX.Element {
  const op = useSharedValue(isReducedMotion ? 1 : 0);
  const ty = useSharedValue(isReducedMotion ? 0 : 36);
  const weight = useSharedValue<string>(isReducedMotion ? '600' : '300');

  useEffect(() => {
    if (isReducedMotion) return;
    const d = 200 + index * motionStagger.loose;
    op.value = withDelay(d, withTiming(1, { duration: 900, easing: EASE_CINEMATIC }));
    ty.value = withDelay(d, withSpring(0, springPresets.settle));
    weight.value = withDelay(d, withTiming('600', { duration: 1400, easing: EASE_EDITORIAL }));
  }, [op, ty, weight, index, isReducedMotion]);

  const entryStyle = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }],
  }));

  const ALLOWED_FONT_WEIGHTS = ['300', '400', '500', '600', '700', '800'] as const;
  type FontWeight = typeof ALLOWED_FONT_WEIGHTS[number];
  const fontWeight = (ALLOWED_FONT_WEIGHTS.includes(weight.value as FontWeight)
    ? weight.value
    : '600') as FontWeight;

  return (
    <Animated.View style={[{ marginHorizontal: 2 }, entryStyle]}>
      <Text
        style={{
          position: 'absolute',
          fontSize: 124,
          fontFamily: SERIF_STACK,
          fontWeight,
          color: 'rgba(224,184,112,0.10)',
          textShadowColor: 'rgba(224,184,112,0.40)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 36,
          letterSpacing: 6,
        }}
      >
        {char}
      </Text>
      <Text
        style={{
          position: 'absolute',
          fontSize: 124,
          fontFamily: SERIF_STACK,
          fontWeight,
          color: 'rgba(242,234,217,0.06)',
          textShadowColor: 'rgba(242,234,217,0.30)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 18,
          letterSpacing: 6,
        }}
      >
        {char}
      </Text>
      <Text
        style={{
          fontSize: 124,
          fontFamily: SERIF_STACK,
          fontWeight,
          color: lightColors.text.secondary,
          textShadowColor: 'rgba(224,184,112,0.18)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 8,
          letterSpacing: 6,
        }}
      >
        {char}
      </Text>
    </Animated.View>
  );
}
