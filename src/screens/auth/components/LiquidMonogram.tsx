import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle as useRAS,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { lightColors } from '@/theme/tokens/colors';

const SANS = Platform.select({ ios: 'SF Pro Display', android: 'Roboto', default: 'Inter' }) ?? 'Inter';

export function LiquidMonogram({ isReducedMotion }: { isReducedMotion: boolean }): React.JSX.Element {
  const op = useSharedValue(isReducedMotion ? 1 : 0);
  const breath = useSharedValue(0);
  useEffect(() => {
    if (isReducedMotion) return;
    op.value = withDelay(200, withTiming(1, { duration: 1100, easing: Easing.bezier(0.16, 1, 0.3, 1) }));
    breath.value = withDelay(800, withRepeat(withTiming(1, { duration: 4800, easing: Easing.bezier(0.37, 0, 0.63, 1) }), -1, true));
  }, [op, breath, isReducedMotion]);
  const style = useRAS(() => ({ opacity: op.value, transform: [{ scale: 1 + breath.value * 0.012 }] }));
  return (
    <Animated.View style={[{ alignItems: 'center', gap: 22 }, style]}>
      {/* Chrome frame ring around the monogram */}
      <View style={{ width: 168, height: 168, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: 168, height: 168, borderRadius: 84, borderWidth: 1, borderColor: 'rgba(186,230,253,0.30)' }} />
        <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(186,230,253,0.18)' }} />
        <Text style={{ fontSize: 88, fontWeight: '800', color: lightColors.surface.button, letterSpacing: -2, fontFamily: SANS, textShadowColor: 'rgba(34,211,238,0.55)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 24 }}>V</Text>
        <View style={{ position: 'absolute', top: 14, right: 14, width: 6, height: 6, borderRadius: 3, backgroundColor: lightColors.semantic.vexCyan }} />
        <View style={{ position: 'absolute', bottom: 14, left: 14, width: 6, height: 6, borderRadius: 3, backgroundColor: lightColors.accent.purple }} />
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ color: lightColors.accent.blue, fontSize: 11, fontWeight: '600', letterSpacing: 6, textTransform: 'uppercase' }}>— N° 001 —</Text>
        <Text style={{ color: lightColors.surface.button, fontSize: 32, fontWeight: '200', letterSpacing: 14, fontFamily: SANS }}>VEX</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 28, height: 1, backgroundColor: 'rgba(125,211,252,0.5)' }} />
          <View style={{ width: 4, height: 4, backgroundColor: lightColors.semantic.vexCyan, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: 28, height: 1, backgroundColor: 'rgba(125,211,252,0.5)' }} />
        </View>
        <Text style={{ color: 'rgba(186,230,253,0.7)', fontSize: 13, fontWeight: '300', letterSpacing: 1.6, textAlign: 'center', maxWidth: 280, marginTop: 4 }}>Engage the work. Leave with proof.</Text>
      </View>
    </Animated.View>
  );
}
