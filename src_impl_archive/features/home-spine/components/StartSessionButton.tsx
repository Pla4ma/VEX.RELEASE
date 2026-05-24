import React, { useMemo } from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withRepeat, withSequence, cancelAnimation, useSharedValue } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { StartSessionButtonCompact } from './StartSessionButtonCompact';
import { useStartSessionButtonColors } from './start-session-button-colors';
export interface StartSessionButtonProps {
  /** Primary label text */
  label?: string;
  /** Secondary subtitle text */
  subtitle?: string;
  /** Resume state - shows elapsed time if resuming */
  resumeTimeSeconds?: number | null;
  /** Number of squad members currently focusing */
  squadMembersFocusing?: number;
  /** Streak risk level for urgency styling */
  streakRiskLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Hours remaining until streak breaks */
  streakHoursRemaining?: number | null;
  /** Loading state while creating session */
  isLoading?: boolean;
  /** Whether user has an active (paused) session */
  hasActiveSession?: boolean;
  /** Press handler */
  onPress: () => void;
  /** Optional test ID */
  testID?: string;
  /** PHASE 7.3: Boss name for Final Strike mode */
  bossName?: string;
  /** PHASE 7.3: Final Strike mode (boss at 1-15% health) */
  isFinalStrike?: boolean;
}
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
export function StartSessionButton({ label, subtitle, resumeTimeSeconds, squadMembersFocusing, streakRiskLevel = 'NONE', streakHoursRemaining, isLoading = false, hasActiveSession = false, onPress, testID, bossName, isFinalStrike = false }: StartSessionButtonProps): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const colors = useStartSessionButtonColors(streakRiskLevel, hasActiveSession, isFinalStrike);
  React.useEffect(() => {
    if (streakRiskLevel === 'CRITICAL' || streakRiskLevel === 'HIGH') {
      scale.value = withRepeat(withSequence(withSpring(1.02, { damping: 3, stiffness: 150 }), withSpring(1, { damping: 3, stiffness: 150 })), -1, true);
    } else {
      cancelAnimation(scale);
      scale.value = 1;
    }
    return () => {
      cancelAnimation(scale);
    };
  }, [streakRiskLevel, scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const buttonLabel = useMemo(() => {
    if (label) {
      return label;
    }
    if (hasActiveSession) {
      return 'Resume Session';
    }
    if (isFinalStrike && bossName) {
      return `⚔️ Defeat ${bossName} Now`;
    }
    return 'Start Focus Session';
  }, [label, hasActiveSession, isFinalStrike, bossName]);
  const subtitleText = useMemo(() => {
    if (subtitle) {
      return subtitle;
    }
    if (hasActiveSession && resumeTimeSeconds) {
      return `${formatTime(resumeTimeSeconds)} elapsed`;
    }
    if (isFinalStrike) {
      return '🔥 Final Strike mode — guaranteed defeat this session!';
    }
    if (squadMembersFocusing && squadMembersFocusing > 0) {
      return `${squadMembersFocusing} squad member${squadMembersFocusing > 1 ? 's' : ''} currently focusing`;
    }
    if (streakRiskLevel === 'CRITICAL' && streakHoursRemaining !== null) {
      return `⚠️ ${streakHoursRemaining}h left to save your streak!`;
    }
    if (streakRiskLevel === 'HIGH' && streakHoursRemaining !== null) {
      return `⏰ ${streakHoursRemaining} hours remaining`;
    }
    return 'Tap to begin your focus session';
  }, [subtitle, hasActiveSession, resumeTimeSeconds, isFinalStrike, squadMembersFocusing, streakRiskLevel, streakHoursRemaining]);
  const isUrgent = streakRiskLevel === 'CRITICAL' || streakRiskLevel === 'HIGH' || isFinalStrike;
  return (
    <Animated.View style={animatedStyle} testID={testID}>
      <Pressable onPress={onPress} disabled={isLoading} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box
          mx="lg"
          p="lg"
          borderRadius="2xl"
          style={{
            backgroundColor: colors.gradient[0],
          }}
        >
          {/* Gradient background via Box styling */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            borderRadius="2xl"
            style={{
              backgroundColor: colors.gradient[0],
            }}
          />
          {/* Content */}
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flex={1} gap="xs">
              {/* Label */}
              <Box flexDirection="row" alignItems="center" gap="sm">
                {hasActiveSession && <Text fontSize={20}>▶️</Text>}
                {isUrgent && !hasActiveSession && <Text fontSize={20}>🔥</Text>}
                <Text variant="h4" color={theme.colors.text.inverse} fontWeight="700">
                  {buttonLabel}
                </Text>
              </Box>
              {/* Subtitle */}
              <Text variant="bodySmall" color={theme.colors.text.inverse} style={{ opacity: 0.8 }}>
                {subtitleText}
              </Text>
            </Box>
            {/* Right side: Loading or Arrow */}
            {isLoading ? (
              <ActivityIndicator color={theme.colors.text.inverse} />
            ) : (
              <Box width={44} height={44} borderRadius="full" bg={`${theme.colors.text.inverse}20`} justifyContent="center" alignItems="center">
                <Text fontSize={20} color={theme.colors.text.inverse}>
                  {hasActiveSession ? '▶' : '›'}
                </Text>
              </Box>
            )}
          </Box>
          {/* Risk indicator bar for critical states */}
          {isUrgent && !isLoading && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height={3}
              style={{
                backgroundColor: (theme.colors.error as Record<string, string>)[300],
              }}
            />
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
}
export { StartSessionButtonCompact };
export default StartSessionButton;
