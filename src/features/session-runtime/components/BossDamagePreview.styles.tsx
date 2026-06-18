import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

export function BossDamageSkeleton(): React.ReactNode {
  const { theme } = useTheme();
  return (
    <Box p="md" borderRadius="lg" bg={`${theme.colors.background.elevated}80`}>
      <Box flexDirection="row" alignItems="center" gap="md">
        <Box
          width={40}
          height={40}
          borderRadius="lg"
          bg={theme.colors.background.tertiary}
        />
        <Box gap="xs" flex={1}>
          <Box
            width={80}
            height={14}
            borderRadius="sm"
            bg={theme.colors.background.tertiary}
          />
          <Box
            width="100%"
            height={6}
            borderRadius="full"
            bg={theme.colors.background.tertiary}
          />
        </Box>
      </Box>
    </Box>
  );
}

export function BossIcon({ willDefeat }: { willDefeat: boolean }): React.ReactNode {
  const { theme } = useTheme();
  const isReducedMotion = useReducedMotion();
  const scaleValue = useSharedValue(1);
  const rotateValue = useSharedValue(0);
  useEffect(() => {
    if (willDefeat && !isReducedMotion) {
      scaleValue.value = withRepeat(
        withSequence(
          withSpring(1.3, { damping: 3, stiffness: 200 }),
          withSpring(1.1, { damping: 3, stiffness: 200 }),
        ),
        -1,
        true,
      );
      rotateValue.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 100 }),
          withTiming(5, { duration: 100 }),
        ),
        -1,
        true,
      );
    }
  }, [willDefeat, scaleValue, rotateValue, isReducedMotion]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleValue.value },
      { rotate: `${rotateValue.value}deg` },
    ],
  }));
  return (
    <Animated.View style={animatedStyle}>
      <Box
        width={44}
        height={44}
        borderRadius="lg"
        bg={
          willDefeat
            ? `${theme.colors.success[500]}30`
            : theme.colors.background.tertiary
        }
        justifyContent="center"
        alignItems="center"
        borderWidth={willDefeat ? 2 : 1}
        borderColor={
          willDefeat ? theme.colors.success.DEFAULT : theme.colors.border.light
        }
      >
        <Text fontSize={24}>{willDefeat ? '⚔️' : '👹'}</Text>
      </Box>
    </Animated.View>
  );
}

export function DamageEstimate({
  damage,
  willDefeat,
}: {
  damage: number;
  willDefeat: boolean;
}): React.ReactNode {
  const { theme } = useTheme();
  return (
    <Box flexDirection="row" alignItems="center" gap="xs" mt="xs">
      <Text fontSize={12}>⚔️</Text>
      <Text
        variant="caption"
        color={willDefeat ? theme.colors.success.DEFAULT : 'text.secondary'}
        fontWeight={willDefeat ? '700' : '500'}
      >
        {willDefeat ? 'DEFEATING BLOW: ' : 'This session: '}
        {damage} dmg
      </Text>
      {willDefeat && <Text fontSize={12}>🎉</Text>}
    </Box>
  );
}
