import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { springPresets } from '../../../theme/tokens/motion';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

/**
 * EditorialRule — the "hairline · diamond · hairline" rule below the wordmark.
 * Reveals with a precise scale-in (no overshoot) and full opacity.
 */
export function EditorialRule({ isReducedMotion }: { isReducedMotion: boolean }): React.JSX.Element {
  const scale = useSharedValue(isReducedMotion ? 1 : 0);
  const op = useSharedValue(isReducedMotion ? 1 : 0);
  useEffect(() => {
    if (isReducedMotion) return;
    scale.value = withDelay(1200, withSpring(1, springPresets.precise));
    op.value = withDelay(1200, withTiming(1, { duration: 600, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
  }, [scale, op, isReducedMotion]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scaleX: scale.value }],
    opacity: op.value,
  }));
  return (
    <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, style]}>
      <View style={{ width: 80, height: 1, backgroundColor: rgbaColors.rgb_224_184_112_0_55 }} />
      <View style={{ width: 5, height: 5, backgroundColor: rgbaColors.rgb_224_184_112_0_85, transform: [{ rotate: '45deg' }] }} />
      <View style={{ width: 80, height: 1, backgroundColor: rgbaColors.rgb_224_184_112_0_55 }} />
    </Animated.View>
  );
}
