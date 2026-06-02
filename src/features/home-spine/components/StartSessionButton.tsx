import React, { useMemo } from 'react';
import { Pressable, ActivityIndicator, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  cancelAnimation,
  useSharedValue,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { StartSessionButtonCompact } from './StartSessionButtonCompact';
import { useStartSessionButtonColors } from './start-session-button-colors';
import type { StartSessionButtonProps } from './start-session-button-types';
import { useStartSessionButtonText } from './useStartSessionButtonText';
import { sessionStart } from '../../../utils/haptics';
export type { StartSessionButtonProps };

export function StartSessionButton({
  label,
  subtitle,
  resumeTimeSeconds,
  squadMembersFocusing,
  streakRiskLevel = 'NONE',
  streakHoursRemaining,
  isLoading = false,
  hasActiveSession = false,
  onPress,
  testID,
  bossName,
  isFinalStrike = false,
}: StartSessionButtonProps): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const colors = useStartSessionButtonColors(
    streakRiskLevel,
    hasActiveSession,
    isFinalStrike,
  );
  const { buttonLabel, subtitleText, isUrgent, urgencyIcon } =
    useStartSessionButtonText({
      label,
      subtitle,
      resumeTimeSeconds,
      squadMembersFocusing,
      streakRiskLevel,
      streakHoursRemaining,
      hasActiveSession,
      isFinalStrike,
      bossName,
    });

  React.useEffect(() => {
    if (streakRiskLevel === 'CRITICAL' || streakRiskLevel === 'HIGH') {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.02, { damping: 3, stiffness: 150 }),
          withSpring(1, { damping: 3, stiffness: 150 }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(scale);
      scale.value = 1;
    }
    return () => cancelAnimation(scale);
  }, [streakRiskLevel, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle} testID={testID}>
      <Pressable
        onPress={() => { sessionStart(); onPress?.(); }}
        disabled={isLoading}
        accessibilityLabel={buttonLabel}
        accessibilityRole="button"
        accessibilityHint="Double tap to start a focus session"
      >
        <Box
          mx="lg"
          p="lg"
          borderRadius="2xl"
          style={{ backgroundColor: colors.gradient[0] }}
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            borderRadius="2xl"
            style={{ backgroundColor: colors.gradient[0] }}
          />
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box flex={1} gap="xs">
              <Box flexDirection="row" alignItems="center" gap="sm">
                {hasActiveSession && (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: `${theme.colors.text.inverse}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="play" size="sm" color={theme.colors.text.inverse} />
                  </View>
                )}
                {urgencyIcon && !hasActiveSession && (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: `${theme.colors.error.DEFAULT}25`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={urgencyIcon} size="sm" color={theme.colors.error.light} />
                  </View>
                )}
                <Text
                  variant="h4"
                  color={theme.colors.text.inverse}
                  fontWeight="700"
                >
                  {buttonLabel}
                </Text>
              </Box>
              <Text
                variant="bodySmall"
                color={theme.colors.text.inverse}
                style={{ opacity: 0.8 }}
              >
                {subtitleText}
              </Text>
            </Box>
            {isLoading ? (
              <ActivityIndicator color={theme.colors.text.inverse} />
            ) : (
              <Box
                width={44}
                height={44}
                borderRadius="full"
                bg={`${theme.colors.text.inverse}20`}
                justifyContent="center"
                alignItems="center"
              >
                <Icon
                  name={hasActiveSession ? 'play' : 'chevron-right'}
                  size="md"
                  color={theme.colors.text.inverse}
                />
              </Box>
            )}
          </Box>
          {isUrgent && !isLoading && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height={3}
              style={{ backgroundColor: theme.colors.error.DEFAULT }}
            />
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
}
export { StartSessionButtonCompact };
export default StartSessionButton;
