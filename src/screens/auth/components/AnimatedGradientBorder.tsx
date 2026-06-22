import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedGradientBorderProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderWidth?: number;
  borderRadius?: number;
  gradientColors?: readonly [string, string, ...string[]];
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function AnimatedGradientBorder({
  children,
  style,
  borderWidth = 1.5,
  borderRadius = 24,
  gradientColors = ['rgba(0,229,255,0.35)', 'rgba(139,92,246,0.25)', 'rgba(0,229,255,0.35)'] as const,
}: AnimatedGradientBorderProps): React.ReactNode {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 9000 }),
      -1,
      false,
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          position: 'relative',
        },
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          {
            position: 'absolute',
            width: '200%',
            height: '200%',
            top: '-50%',
            left: '-50%',
          },
          animatedStyle,
        ]}
      />
      <View
        style={{
          margin: borderWidth,
          borderRadius: Math.max(0, borderRadius - borderWidth),
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {children}
      </View>
    </View>
  );
}
