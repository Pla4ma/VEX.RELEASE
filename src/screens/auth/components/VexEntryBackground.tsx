import React, { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Starfield } from './Starfield';
import { lightColors } from '@/theme/tokens/colors';

export function VexEntryBackground(): JSX.Element {
  const { width, height } = useWindowDimensions();

  const o1x = useSharedValue(0);
  const o1y = useSharedValue(0);
  const o2x = useSharedValue(0);
  const o2y = useSharedValue(0);
  const o3x = useSharedValue(0);
  const o3y = useSharedValue(0);

  useEffect(() => {
    o1x.value = withRepeat(withTiming(40, { duration: 14000 }), -1, true);
    o1y.value = withRepeat(withTiming(-30, { duration: 11000 }), -1, true);
    o2x.value = withRepeat(withTiming(-50, { duration: 18000 }), -1, true);
    o2y.value = withRepeat(withTiming(40, { duration: 13000 }), -1, true);
    o3x.value = withRepeat(withTiming(30, { duration: 16000 }), -1, true);
    o3y.value = withRepeat(withTiming(50, { duration: 12000 }), -1, true);
  }, [o1x, o1y, o2x, o2y, o3x, o3y]);

  const s1 = useAnimatedStyle(() => ({
    transform: [{ translateX: o1x.value }, { translateY: o1y.value }],
  }));
  const s2 = useAnimatedStyle(() => ({
    transform: [{ translateX: o2x.value }, { translateY: o2y.value }],
  }));
  const s3 = useAnimatedStyle(() => ({
    transform: [{ translateX: o3x.value }, { translateY: o3y.value }],
  }));

  return (
    <View style={{ position: 'absolute', width, height, top: 0, left: 0 }}>
      <LinearGradient
  // TODO(P2-1): map remaining hex colors to theme tokens
        colors={['#060810', '#070A12', lightColors.semantic.backgroundMuted]}
        locations={[0, 0.5, 1]}
        style={{ position: 'absolute', width, height }}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: (width * 0.8) / 2,
            backgroundColor: 'rgba(0,229,255,0.06)',
            top: height * 0.1,
            left: -width * 0.2,
            shadowColor: lightColors.semantic.vexCyan,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 100,
          },
          s1,
        ]}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.9,
            height: width * 0.9,
            borderRadius: (width * 0.9) / 2,
            backgroundColor: 'rgba(139,92,246,0.05)',
            bottom: -height * 0.15,
            right: -width * 0.3,
            shadowColor: lightColors.accent.purple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 120,
          },
          s2,
        ]}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.6,
            height: width * 0.6,
            borderRadius: (width * 0.6) / 2,
            backgroundColor: 'rgba(59,130,246,0.04)',
            top: height * 0.4,
            right: width * 0.1,
            shadowColor: lightColors.accent.blue,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 90,
          },
          s3,
        ]}
        pointerEvents="none"
      />

      <Starfield />
    </View>
  );
}

export default VexEntryBackground;
