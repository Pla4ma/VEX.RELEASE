const colors = [
    lightColors.semantic.danger,
    lightColors.semantic.success,
    lightColors.accent.blue,
    lightColors.semantic.warning,
    lightColors.accent.purple,
    lightColors.accent.pink,
  ];

import React from 'react';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { useWindowDimensions } from 'react-native';
import { lightColors } from '@/theme/tokens/colors';

function ConfettiPiece({
  index,
  color,
}: {
  index: number;
  color: string;
}): React.ReactNode | null {
  const reduceMotion = useReducedMotion();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const startX = Math.random() * SCREEN_WIDTH;
  const endX = startX + (Math.random() - 0.5) * 200;
  const duration = 2000 + Math.random() * 1000;
  const pieceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(endX, { duration }) },
      { translateY: withTiming(SCREEN_HEIGHT + 50, { duration }) },
      { rotate: withTiming(`${Math.random() * 720}deg`, { duration }) },
    ],
  }));

  if (reduceMotion) {
    return null;
  }
  return (
    <Animated.View
      entering={FadeIn.duration(100).delay(index * 50)}
      style={[
        {
          position: 'absolute',
          left: startX,
          top: -20,
          width: 10,
          height: 10,
          backgroundColor: color,
          borderRadius: 2,
        },
        pieceStyle,
      ]}
    />
  );
}

export function ConfettiBurst({ count = 50 }: { count?: number }): React.ReactNode {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ConfettiPiece key={i} index={i} color={colors[i % colors.length]!} />
      ))}
    </>
  );
}