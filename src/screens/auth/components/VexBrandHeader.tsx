import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '../../../components/primitives/Text';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';
import { lightColors } from '@/theme/tokens/colors';

function StatusDot(): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const pulse = useSharedValue(isReducedMotion ? 0.6 : 0.25);

  React.useEffect(() => {
    if (isReducedMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 2400 }), -1, true);
  }, [pulse, isReducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 + pulse.value * 0.5,
    transform: [{ scale: 0.82 + pulse.value * 0.18 }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: lightColors.semantic.success,
          shadowColor: lightColors.semantic.success,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
        },
        style,
      ]}
    />
  );
}

export function VexBrandHeader(): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <View style={{ alignItems: 'center', gap: theme.spacing[1] }}>
      {/* Status pill */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: theme.spacing[2],
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[1],
          borderRadius: 9999,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderWidth: 0.5,
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <StatusDot />
        <Text
          color="semantic.liquidTextMuted"
          fontSize={11}
          fontWeight="500"
          opacity={0.65}
        >
          System active
        </Text>
      </View>

      {/* VEX — layered premium wordmark */}
      <View style={{ position: 'relative', alignItems: 'center' }}>
        {/* Violet outer glow layer */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            shadowColor: lightColors.accent.purple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.55,
            shadowRadius: 36,
          }}
        >
          <Text
            color="semantic.liquidText"
            fontSize={40}
            fontWeight="800"
            letterSpacing={5}
            lineHeight={48}
            textAlign="center"
            style={{ opacity: 0 }}
          >
            VEX
          </Text>
        </View>

        {/* Orange core reflection underneath */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 8,
  // TODO(P2-1): map remaining hex colors to theme tokens
            shadowColor: '#FF8A24',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
          }}
        >
          <Text
            color="semantic.liquidText"
            fontSize={40}
            fontWeight="800"
            letterSpacing={5}
            lineHeight={48}
            textAlign="center"
            style={{ opacity: 0 }}
          >
            VEX
          </Text>
        </View>

        {/* Main text — crisp white with subtle textShadow */}
        <Text
          color="semantic.liquidText"
          fontSize={40}
          fontWeight="800"
          letterSpacing={5}
          lineHeight={48}
          textAlign="center"
          style={{
            textShadowColor: 'rgba(139, 92, 246, 0.25)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
          }}
        >
          VEX
        </Text>
      </View>

      {/* Focus core accent mark */}
      <View style={{ alignItems: 'center', marginTop: 2 }}>
        <LinearGradient
          colors={['rgba(166, 107, 255, 0.30)', 'rgba(255, 138, 36, 0.35)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: 32,
            height: 2,
            borderRadius: 1,
          }}
        />
      </View>

      {/* Tagline */}
      <View style={{ marginTop: theme.spacing[1] }}>
        <Text
          color="semantic.liquidTextSoft"
          fontSize={14}
          fontWeight="500"
          letterSpacing={0.2}
          textAlign="center"
          opacity={0.82}
        >
          Your focus engine is ready.
        </Text>
      </View>
    </View>
  );
}
