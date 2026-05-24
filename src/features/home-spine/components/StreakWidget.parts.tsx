import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { StreakWidgetProps } from './StreakWidget';
import type { ActiveStreakWager } from './streak-widget-types';

export function StreakWidgetSkeleton(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box m="lg" p="lg" borderRadius="xl" bg={theme.colors.background.secondary}>
      <Box flexDirection="row" alignItems="center" gap="md">
        <Box width={56} height={56} borderRadius="full" bg={theme.colors.background.tertiary} />
        <Box gap="sm" flex={1}>
          <Box width={100} height={20} borderRadius="sm" bg={theme.colors.background.tertiary} />
          <Box width={150} height={14} borderRadius="sm" bg={theme.colors.background.tertiary} />
        </Box>
      </Box>
    </Box>
  );
}

export function FlameIcon({
  riskLevel,
  currentDays,
  size = 48,
}: {
  riskLevel: StreakWidgetProps['riskLevel'];
  currentDays: number;
  size?: number;
}): JSX.Element {
  const flameAnimation = useAnimatedStyle(() => {
    const intensity = riskLevel === 'CRITICAL' ? 1.5 : riskLevel === 'HIGH' ? 1.3 : 1;

    return {
      transform: [{
        scale: riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
          ? withRepeat(
            withSequence(
              withSpring(1.1 * intensity, { damping: 3, stiffness: 200 }),
              withSpring(0.95 * intensity, { damping: 3, stiffness: 200 }),
            ),
            -1,
            true,
          )
          : 1,
      }],
    };
  });

  const icon = riskLevel === 'MEDIUM' ? '!' : currentDays > 0 ? '*' : '+';

  return <Animated.Text style={[{ fontSize: size }, flameAnimation]}>{icon}</Animated.Text>;
}

export function RiskBanner({
  riskLevel,
  hoursRemaining,
}: {
  riskLevel: StreakWidgetProps['riskLevel'];
  hoursRemaining: number | null;
}): JSX.Element | null {
  const { theme } = useTheme();

  if (riskLevel === 'NONE' || riskLevel === 'LOW' || hoursRemaining === null) {return null;}

  const isCritical = riskLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH';
  const bg = isCritical
    ? `${theme.colors.error[500]}30`
    : isHigh
      ? `${theme.colors.error[500]}20`
      : `${theme.colors.warning[500]}20`;
  const border = isCritical || isHigh ? theme.colors.error.DEFAULT : theme.colors.warning.DEFAULT;
  const text = isCritical
    ? `LAST CHANCE - ${hoursRemaining}h left!`
    : isHigh
      ? `Streak at risk - ${hoursRemaining} hours remaining`
      : `${hoursRemaining} hours to save your streak`;

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Box mt="md" p="sm" borderRadius="lg" bg={bg} borderWidth={1} borderColor={border}>
        <Text variant="caption" color={border} fontWeight="600" textAlign="center">
          {text}
        </Text>
      </Box>
    </Animated.View>
  );
}

export function MultiplierBadge({ multiplier }: { multiplier: number }): JSX.Element {
  const { theme } = useTheme();
  const color = multiplier >= 2
    ? theme.colors.accent.purple
    : multiplier >= 1.5
      ? theme.colors.accent.blue
      : multiplier > 1
        ? theme.colors.success.DEFAULT
        : theme.colors.text.tertiary;

  return (
    <Box
      px="sm"
      py="xs"
      borderRadius="full"
      bg={multiplier > 1 ? `${color}20` : theme.colors.background.tertiary}
      borderWidth={multiplier > 1 ? 1 : 0}
      borderColor={color}
    >
      <Text variant="caption" color={color} fontWeight={multiplier > 1 ? '700' : undefined}>
        {multiplier.toFixed(1)}x{multiplier > 1 ? ' multiplier' : ''}
      </Text>
    </Box>
  );
}

export function WagerSection({
  currentDays,
  activeWager,
  onWagerPress,
}: {
  currentDays: number;
  activeWager?: ActiveStreakWager | null;
  onWagerPress?: () => void;
}): JSX.Element | null {
  const { theme } = useTheme();

  if (currentDays < 3 || !onWagerPress) {return null;}

  return (
    <Pressable
      onPress={onWagerPress}
      style={{
        alignItems: 'center',
        borderTopColor: theme.colors.border.light,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing[3],
        paddingTop: theme.spacing[3],
      }}
      accessibilityLabel={activeWager ? 'View active wager progress' : 'Place a streak wager'}
      accessibilityRole="button"
      accessibilityHint={activeWager ? 'Opens your wager progress sheet' : 'Bet on your streak performance for rewards'}
    >
      <Text variant="caption" color="text.secondary">
        {activeWager ? 'Wager active' : 'Place a wager'}
      </Text>
      <Text variant="caption" color={activeWager ? 'primary.500' : 'text.tertiary'} fontWeight={activeWager ? '700' : undefined}>
        {activeWager
          ? `${activeWager.currentProgress}/${activeWager.target} ${activeWager.progressUnit}`
          : 'Bet on your streak'}
      </Text>
    </Pressable>
  );
}
