import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { Box } from '../../../components/primitives/Box';
import { useTheme } from '../../../theme';
import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
import { useOnboardingResumeState } from '../hooks/useOnboardingResumeState';

interface OnboardingResumePromptProps {
  onResume: () => void;
  onRestart: () => void;
  onDismiss: () => void;
}

export function OnboardingResumePrompt({
  onResume,
  onRestart,
  onDismiss,
}: OnboardingResumePromptProps): JSX.Element | null {
  const { theme } = useTheme();
  const {
    state,
    isVisible,
    selectedAction,
    getStepLabel,
    getProgressSummary,
    handleResume,
    handleRestart,
    handleDismiss,
  } = useOnboardingResumeState(onResume, onRestart, onDismiss);

  if (!isVisible || !state) {return null;}

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg={launchColors.rgb_0_0_0_0_7}
      justifyContent="center"
      alignItems="center"
      p="lg"
      zIndex={1000}
    >
      <Animated.View entering={FadeIn} exiting={FadeOut}>
        <Box bg="background.primary" p="xl" borderRadius="xl" width="100%" maxWidth={400}>
          <Animated.View entering={FadeInUp.delay(100)}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primary[100] },
              ]}
            >
              <Text style={styles.icon}>👋</Text>
            </View>
            <Text variant="h3" textAlign="center" mb="md">
              Welcome Back!
            </Text>
            <Text variant="body" color="text.secondary" textAlign="center" mb="lg">
              You started setting up your focus journey but didn't finish.
              {getProgressSummary()}
            </Text>
            <Box bg="background.secondary" p="md" borderRadius="lg" mb="md">
              <Box flexDirection="row" justifyContent="space-between" mb="xs">
                <Text variant="bodySmall" color="text.tertiary">Setup Progress</Text>
                <Text variant="bodySmall" color="text.secondary">
                  Step {state.stepNumber} of 4
                </Text>
              </Box>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(state.stepNumber / 4) * 100}%`,
                      backgroundColor: theme.colors.primary[500],
                    },
                  ]}
                />
              </View>
              <Text variant="caption" color="text.tertiary" textAlign="center" mt="xs">
                Next up: {getStepLabel(state.step!)}
              </Text>
            </Box>
            {state.isHighRisk && (
              <Animated.View entering={FadeInUp.delay(200)}>
                <Box bg={theme.colors.warning.light} p="md" borderRadius="lg" mb="lg">
                  <Text variant="bodySmall" color={theme.colors.warning.DEFAULT} textAlign="center">
                    ⚠️ We noticed you've had trouble completing setup. It only
                    takes 2 minutes to finish!
                  </Text>
                </Box>
              </Animated.View>
            )}
            <Box gap="sm">
              <Button
                variant="primary"
                size="lg"
                onPress={handleResume}
                disabled={selectedAction !== null}
                isLoading={selectedAction === 'resume'}
                accessibilityLabel="Continue setup"
                accessibilityRole="button"
                accessibilityHint="Double tap to select"
              >
                Continue Setup →
              </Button>
              <Button
                variant="secondary"
                size="md"
                onPress={handleRestart}
                disabled={selectedAction !== null}
                isLoading={selectedAction === 'restart'}
                accessibilityLabel="Start fresh"
                accessibilityRole="button"
                accessibilityHint="Double tap to select"
              >
                Start Fresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onPress={handleDismiss}
                disabled={selectedAction !== null}
                accessibilityLabel="Skip onboarding"
                accessibilityRole="button"
                accessibilityHint="Double tap to select"
              >
                Skip for Now
              </Button>
            </Box>
            <Text variant="caption" color="text.tertiary" textAlign="center" mt="lg">
              You can always complete setup later from Settings.
            </Text>
          </Animated.View>
        </Box>
      </Animated.View>
    </Box>
  );
}

const styles = createSheet({
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  icon: { fontSize: 30 },
  progressBar: {
    height: 6,
    backgroundColor: launchColors.rgb_0_0_0_0_1,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
});
export default OnboardingResumePrompt;
