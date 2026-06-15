import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { useTheme } from '../../../theme/ThemeContext';
import {
  getRiskConfig,
  type StreakRiskBannerProps,
} from './streak-risk-config';
import { sessionStart } from '../../../utils/haptics';

export type { StreakRiskLevel, StreakRiskBannerProps } from './streak-risk-config';

export function StreakRiskBanner({
  riskLevel,
  hoursRemaining,
  streakDays,
  suggestedDuration,
  onStartSession,
}: StreakRiskBannerProps): JSX.Element | null {
  const { theme } = useTheme();
  const config = getRiskConfig(riskLevel, theme);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: config?.pulse
          ? withRepeat(
              withSequence(
                withTiming(1, { duration: 800 }),
                withTiming(1.02, { duration: 800 }),
              ),
              -1,
              true,
            )
          : 1,
      },
    ],
    borderColor: config?.pulse
      ? withRepeat(
          withSequence(
            withTiming(config.border, { duration: 500 }),
            withTiming(`${config.border}80`, { duration: 500 }),
          ),
          -1,
          true,
        )
      : config?.border,
  }));
  if (riskLevel === 'NONE' || riskLevel === 'LOW') {
    return null;
  }
  if (!config) {
    return null;
  }
  return (
    <Pressable
      onPress={() => { sessionStart(); onStartSession(suggestedDuration); }}
      accessibilityLabel={`Start ${suggestedDuration}-minute session to protect your ${streakDays}-day streak`}
      accessibilityRole="button"
      accessibilityHint="Double tap to start a focus session"
    >
      <Animated.View
        style={[
          {
            marginHorizontal: theme.spacing[4],
            marginTop: theme.spacing[4],
            borderRadius: 12,
            borderWidth: 2,
            overflow: 'hidden',
          },
          pulseStyle,
        ]}
      >
        <Box bg={config.bg} p="md">
          <Box flexDirection="row" alignItems="center" gap="md">
            <Box
              width={44}
              height={44}
              borderRadius="full"
              bg={`${config.border}30`}
              justifyContent="center"
              alignItems="center"
            >
              <Icon
                name={config.iconName}
                size="md"
                color={config.text}
                variant="solid"
              />
            </Box>

            <Box flex={1}>
              <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
                <Text variant="caption" color={config.text} fontWeight="700">
                  {config.label}
                </Text>
                <Text variant="caption" color="text.tertiary">
                  · {hoursRemaining}h left
                </Text>
              </Box>

              <Text variant="body" color="text.primary" fontWeight="600">
                {streakDays}-day streak at risk
              </Text>

              <Text variant="bodySmall" color={config.text}>
                {config.message}
              </Text>
            </Box>

            <Icon name="arrow-right" size="sm" color={config.text} variant="solid" />
          </Box>
        </Box>
      </Animated.View>
    </Pressable>
  );
}

export { StreakCriticalAlert } from './StreakCriticalAlert';

export default StreakRiskBanner;
