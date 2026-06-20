import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme/ThemeContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { VexFocusMark } from '../../../screens/auth/components/VexFocusMark';
import { PathSelectionCard } from './PathSelectionCard';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { spacing } from '../../../theme/tokens/spacing';
import type { OnboardingPath } from '../onboarding-paths';
import { Text as VexText } from '../../../components/primitives/Text';

interface WelcomeScreenProps {
  onStart: (path: OnboardingPath) => void;
}

function AnimatedBackground(): React.ReactNode {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();

  const orb1 = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isReducedMotion
          ? 1
          : withRepeat(withTiming(1.06, { duration: 10000 }), -1, true),
      },
    ],
    opacity: 0.2,
  }));

  const orb2 = useAnimatedStyle(() => ({
    transform: [
      {
        scale: isReducedMotion
          ? 1
          : withRepeat(withTiming(1.04, { duration: 14000 }), -1, true),
      },
    ],
    opacity: 0.85,
  }));

  return (
    <>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: (width * 0.8) / 2,
            backgroundColor: `${theme.colors.semantic.vexCyan}18`,
            top: -width * 0.2,
            right: -width * 0.2,
          },
          orb1,
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
            backgroundColor: `${theme.colors.semantic.vexCyan}10`,
            bottom: height * 0.1,
            left: -width * 0.2,
          },
          orb2,
        ]}
        pointerEvents="none"
      />
    </>
  );
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps): React.ReactNode {
  const { theme: _theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const [selectedPath, setSelectedPath] = useState<OnboardingPath>('focus');

  const paths: OnboardingPath[] = ['focus', 'plan', 'study', 'habit'];

  return (
    <Box flex={1} bg="background.primary">
      <AnimatedBackground />
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        px="xl"
        gap="xl"
      >
        <Animated.View
          entering={isReducedMotion ? undefined : FadeIn.duration(600).delay(200)}
        >
          <VexFocusMark size={120} />
        </Animated.View>

        <Animated.View
          entering={isReducedMotion ? undefined : FadeInUp.duration(500).delay(300)}
          style={{ width: '100%' }}
        >
          <Box alignItems="center" gap="sm">
            <Text
              variant="hero"
              color="text.primary"
              textAlign="center"
              fontWeight="800"
            >
              How do you want{'\n'}to start?
            </Text>
            <Text variant="bodyLarge" color="text.secondary" textAlign="center">
              VEX adapts to you. Pick the path that feels right.
            </Text>
          </Box>
        </Animated.View>

        <View style={{ width: '100%', gap: spacing[2] }}>
          {paths.map((path, index) => (
            <PathSelectionCard
              key={path}
              path={path}
              isSelected={selectedPath === path}
              onPress={() => setSelectedPath(path)}
              index={index}
            />
          ))}
        </View>

        <Box flex={1} minHeight={20} />

        <Animated.View
          entering={isReducedMotion ? undefined : FadeInUp.duration(500).delay(800)}
          style={{ width: '100%' }}
        >
          <Button variant="primary"
            size="lg"
            fullWidth
            onPress={() => onStart(selectedPath)}
            accessibilityLabel={`Start with ${selectedPath}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to begin your journey"
          >
            <VexText>Begin</VexText>
          </Button>
        </Animated.View>
      </Box>
    </Box>
  );
}

export default WelcomeScreen;
