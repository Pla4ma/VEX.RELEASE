import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Text } from '../primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';
import { SupporterBadge } from './SupporterBadge';

export interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'animated';
  style?: ViewStyle;
  showGlow?: boolean;
  accessibilityLabel?: string;
}

const sizeConfig = {
  sm: { badge: 16, font: 10, glow: 24 },
  md: { badge: 20, font: 12, glow: 32 },
  lg: { badge: 28, font: 16, glow: 44 },
};

export function PremiumBadge({
  size = 'md',
  variant = 'default',
  style,
  showGlow = false,
  accessibilityLabel,
}: PremiumBadgeProps): React.ReactNode {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      scale.value = 1;
      glowOpacity.value = 0;
      return;
    }
    if (variant === 'animated' || showGlow) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withDelay(500, withTiming(0.6, { duration: 800 })),
          withTiming(0, { duration: 800 }),
        ),
        -1,
        true,
      );
    }
  }, [variant, showGlow, scale, glowOpacity, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  const config = sizeConfig[size];

  const variantConfig = {
    default: {
      backgroundColor: theme.colors.primary[500],
      borderColor: theme.colors.primary[400],
      textColor: theme.colors.text.inverse,
    },
    subtle: {
      backgroundColor: theme.colors.primary[100],
      borderColor: theme.colors.primary[200],
      textColor: theme.colors.primary[700],
    },
    animated: {
      backgroundColor: theme.colors.primary[500],
      borderColor: theme.colors.warning.light,
      textColor: theme.colors.text.inverse,
    },
  };

  const Wrapper = variant === 'animated' ? Animated.View : View;
  const GlowWrapper = variant === 'animated' || showGlow ? Animated.View : View;

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={accessibilityLabel ?? "Premium badge"}
      accessibilityRole="image"
    >
      {(variant === 'animated' || showGlow) && (
        <GlowWrapper
          style={[
            styles.glow,
            {
              width: config.glow,
              height: config.glow,
              borderRadius: config.glow / 2,
              backgroundColor: theme.colors.primary[400],
            },
            glowStyle,
          ]}
        />
      )}
      <Wrapper
        style={[
          styles.badge,
          {
            width: config.badge,
            height: config.badge,
            borderRadius: config.badge / 2,
            backgroundColor: variantConfig[variant].backgroundColor,
            borderColor: variantConfig[variant].borderColor,
          },
          variant === 'animated' && animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.text,
            { fontSize: config.font, color: variantConfig[variant].textColor },
          ]}
        >
          P
        </Text>
      </Wrapper>
    </View>
  );
}

export { SupporterBadge };

const styles = createSheet({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: { position: 'absolute' as const },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.85,
    shadowRadius: 4,
    elevation: 3,
  },
  text: { fontWeight: '800' as const, letterSpacing: -0.5 },
});

export default PremiumBadge;
