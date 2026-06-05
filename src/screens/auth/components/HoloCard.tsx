import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

interface HoloCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderWidth?: number;
  borderRadius?: number;
  innerPadding?: number;
  accent?: 'gold' | 'teal' | 'neutral';
  delay?: number;
  float?: boolean;
}

const EASE_AMBIENT = Easing.bezier(0.37, 0, 0.63, 1);

export function HoloCard({
  children,
  style,
  borderRadius = 22,
  innerPadding = 24,
  accent = 'gold',
  delay = 0,
  float = false,
}: HoloCardProps): JSX.Element {
  const sheenPos = useSharedValue(-1);
  const floatY = useSharedValue(0);
  const op = useSharedValue(0);
  const ty = useSharedValue(20);

  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 900, easing: Easing.bezier(0.16, 1, 0.3, 1) }));
    ty.value = withDelay(delay, withTiming(0, { duration: 900, easing: Easing.bezier(0.16, 1, 0.3, 1) }));
    sheenPos.value = withDelay(delay + 1200, withRepeat(
      withTiming(1, { duration: 5000, easing: EASE_AMBIENT }),
      -1, false,
    ));
    if (float) {
      floatY.value = withDelay(delay, withRepeat(
        withTiming(-3, { duration: 5200, easing: EASE_AMBIENT }),
        -1, true,
      ));
    }
  }, [sheenPos, floatY, op, ty, delay, float]);

  const entryStyle = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value + floatY.value }],
  }));

  const sheenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sheenPos.value * 320 - 60 }],
  }));

  const accentColor = accent === 'gold' ? rgbaColors.rgb_224_184_112_0_6 : accent === 'teal' ? rgbaColors.rgb_94_234_212_0_55 : rgbaColors.rgb_245_241_232_0_25;
  const accentSoft = accent === 'gold' ? rgbaColors.rgb_224_184_112_0_10 : accent === 'teal' ? rgbaColors.rgb_94_234_212_0_08 : rgbaColors.rgb_245_241_232_0_05;

  return (
    <Animated.View style={entryStyle}>
      <View style={[
        {
          borderRadius,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: rgbaColors.rgb_14_12_22_0_72,
          borderWidth: 1,
          borderColor: rgbaColors.rgb_245_241_232_0_08,
        },
        style,
      ]}>
        {/* Subtle warm gradient wash on top */}
        <LinearGradient
          colors={[accentSoft, 'transparent']}
          locations={[0, 0.6]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80 }}
        />

        {/* Single hairline accent on top edge */}
        <LinearGradient
          colors={['transparent', accentColor, 'transparent']}
          locations={[0.1, 0.5, 0.9]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1 }}
        />

        {/* Slow light sweep across the surface */}
        <Animated.View
          pointerEvents="none"
          style={[
            { position: 'absolute', top: 0, bottom: 0, width: 40, backgroundColor: rgbaColors.rgb_245_241_232_0_03 },
            sheenStyle,
          ]}
        />

        <View style={{ padding: innerPadding }}>{children}</View>
      </View>
    </Animated.View>
  );
}

export default HoloCard;
