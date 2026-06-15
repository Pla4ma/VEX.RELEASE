import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme/ThemeContext';

export function VexGlassBrand(): React.JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const glow = useSharedValue(isReducedMotion ? 0.55 : 0.28);

  useEffect(() => {
    if (isReducedMotion) {return;}
    glow.value = withRepeat(withTiming(0.72, { duration: 2600 }), -1, true);
  }, [glow, isReducedMotion]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View style={{ alignItems: 'center', gap: theme.spacing[2] }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 12,
            width: 118,
            height: 52,
            borderRadius: 52,
            backgroundColor: theme.colors.semantic.liquidOrange,
            boxShadow: '0px 0px 44px theme.colors.semantic.liquidOrange / 0.8',
          },
          glowStyle,
        ]}
      />
      <Text
        color="semantic.liquidText"
        fontSize={46}
        fontWeight="900"
        letterSpacing={4}
        lineHeight={54}
        textAlign="center"
      >
        VEX
      </Text>
      <View
        style={{
          borderRadius: theme.borderRadius.full,
          borderWidth: 1,
          borderColor: theme.colors.semantic.liquidGlassBorder,
          backgroundColor: theme.colors.semantic.liquidGlass,
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[1],
        }}
      >
        <Text color="semantic.liquidAmber" fontSize={11} fontWeight="800" letterSpacing={1.2}>
          FOCUS ENGINE
        </Text>
      </View>
      <Text
        color="semantic.liquidTextSoft"
        fontSize={15}
        fontWeight="600"
        letterSpacing={0}
        lineHeight={21}
        textAlign="center"
        style={{ maxWidth: 300 }}
      >
        Your focus engine is ready.
      </Text>
    </View>
  );
}
