/**
 * SerifTitle — animates a string with a per-letter stagger fade+rise.
 * Used for "VEX" + screen titles.
 */
import React, { useEffect, useMemo } from 'react';
import { Text, type TextStyle, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { timingPresets } from '@/theme/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type SerifTitleProps = {
  text: string;
  fontSize?: number;
  color?: string;
  letterSpacing?: number;
  lineHeight?: number;
  startDelayMs?: number;
  letterStaggerMs?: number;
  style?: TextStyle;
};

type LetterProps = {
  char: string;
  fontSize: number;
  color: string;
  letterSpacing: number;
  lineHeight: number;
  delay: number;
  style?: TextStyle;
};

function AnimatedLetter({
  char,
  fontSize,
  color,
  letterSpacing,
  lineHeight,
  delay,
  style,
}: LetterProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const opacity = useSharedValue(isReducedMotion ? 1 : 0);
  const translateY = useSharedValue(isReducedMotion ? 0 : 12);

  useEffect(() => {
    if (isReducedMotion) {return;}
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: timingPresets.enter.duration,
        easing: Easing.bezier(...timingPresets.enter.easing),
      }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration: timingPresets.enter.duration,
        easing: Easing.bezier(...timingPresets.enter.easing),
      }),
    );
  }, [opacity, translateY, delay, isReducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text
        style={[
          {
            fontSize,
            lineHeight,
            color,
            letterSpacing,
            fontFamily: 'serif',
            fontWeight: '500',
            textAlign: 'center',
          },
          style,
        ]}
      >
        {char === ' ' ? '\u00A0' : char}
      </Text>
    </Animated.View>
  );
}

export function SerifTitle({
  text,
  fontSize = 44,
  color = '#0A0A0A',
  letterSpacing = -0.5,
  lineHeight = fontSize * 1.1,
  startDelayMs = 0,
  letterStaggerMs = 30,
  style,
}: SerifTitleProps): React.JSX.Element {
  const letters = useMemo(() => Array.from(text), [text]);

  return (
    <View
      accessibilityLabel={text}
      accessibilityRole="header"
      style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}
    >
      {letters.map((char, i) => (
        <AnimatedLetter
          key={`${char}-${i}`}
          color={color}
          delay={startDelayMs + i * letterStaggerMs}
          fontSize={fontSize}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
          char={char}
          style={style}
        />
      ))}
    </View>
  );
}
