import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';

const EASE_EDITORIAL = Easing.bezier(0.22, 1, 0.36, 1);
const SERIF_STACK = Platform.select({
  ios: 'New York',
  android: 'Noto Serif',
  default: 'Georgia',
}) ?? 'Georgia';

/**
 * Colophon — the publication footer line under the login CTA. Two
 * hairline rules with the small-caps publication line between them.
 */
export function Colophon({ delay, isReducedMotion }: { delay: number; isReducedMotion: boolean }): React.JSX.Element {
  const op = useSharedValue(isReducedMotion ? 1 : 0);
  useEffect(() => {
    if (isReducedMotion) return;
    op.value = withDelay(delay, withTiming(1, { duration: 1200, easing: EASE_EDITORIAL }));
  }, [op, delay, isReducedMotion]);
  const style = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View style={[{ alignItems: 'center', gap: 6 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 12, height: 1, backgroundColor: 'rgba(224,184,112,0.45)' }} />
        <Text
          style={{
            color: 'rgba(224,184,112,0.65)',
            fontSize: 9,
            fontFamily: SERIF_STACK,
            fontWeight: '500',
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          Est. MMXXVI · For Builders of Solitude
        </Text>
        <View style={{ width: 12, height: 1, backgroundColor: 'rgba(224,184,112,0.45)' }} />
      </View>
    </Animated.View>
  );
}
