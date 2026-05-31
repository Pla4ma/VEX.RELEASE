import React from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

interface OnboardingWelcomeProps {
  onContinue: () => void;
}

function AdaptivePreview(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box alignItems="center" gap="md">
      <Box
        width={96}
        height={96}
        borderRadius="full"
        bg={theme.colors.primary[500]}
        justifyContent="center"
        alignItems="center"
        borderWidth={2}
        borderColor={theme.colors.primary[300]}
      >
        <Text fontSize={40}>{'\u2699\uFE0F'}</Text>
      </Box>
      <Box width={240} gap="xs">
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="caption" color="text.secondary">
            VEX learns your rhythm
          </Text>
          <Text variant="caption" color="primary.DEFAULT" fontWeight="700">
            Adapting...
          </Text>
        </Box>
        <Box
          height={4}
          borderRadius="full"
          bg={theme.colors.background.tertiary}
          overflow="hidden"
        >
          <Animated.View
            entering={FadeIn.duration(800)}
            style={{
              height: '100%',
              width: '40%',
              backgroundColor: theme.colors.primary[400],
              borderRadius: 2,
            }}
          />
        </Box>
        <Animated.View entering={FadeInUp.delay(800).duration(400)}>
          <Text variant="caption" color="text.tertiary" textAlign="center">
            Study {'\u2022'} Run {'\u2022'} Project {'\u2022'} Clean
          </Text>
        </Animated.View>
      </Box>
    </Box>
  );
}

export function OnboardingWelcome({
  onContinue,
}: OnboardingWelcomeProps): JSX.Element {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  return (
    <Box flex={1} justifyContent="space-between" px="xl" py="2xl">
      <Animated.View entering={FadeIn.duration(600)}>
        <Box alignItems="center" gap="lg" mt="2xl">
          <Box
            width={64}
            height={64}
            borderRadius="xl"
            bg={theme.colors.primary[500]}
            justifyContent="center"
            alignItems="center"
          >
            <Text
              fontSize={32}
              fontWeight="800"
              color={theme.colors.text.inverse}
            >
              V
            </Text>
          </Box>
          <Box alignItems="center" gap="sm">
            <Text
              variant="h1"
              color="text.primary"
              textAlign="center"
              style={{ fontSize: 32, lineHeight: 40 }}
            >
              {'VEX changes based on\nhow you work.'}
            </Text>
            <Text
              variant="body"
              color="text.secondary"
              textAlign="center"
              px="md"
            >
              Answer a few questions, start one focused session, and VEX
              unlocks the system your brain needs.
            </Text>
          </Box>
        </Box>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(600)}>
        <AdaptivePreview />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600).duration(400)}>
        <Box gap="md">
          <Button
            size="lg"
            variant="primary"
            fullWidth
            onPress={onContinue}
            accessibilityLabel="Get started"
            accessibilityRole="button"
            accessibilityHint="Starts the onboarding flow"
          >
            Let&apos;s Go
          </Button>
          <Text variant="caption" color="text.tertiary" textAlign="center">
            Takes 90 seconds. No email required.
          </Text>
        </Box>
      </Animated.View>
    </Box>
  );
}

export default OnboardingWelcome;
