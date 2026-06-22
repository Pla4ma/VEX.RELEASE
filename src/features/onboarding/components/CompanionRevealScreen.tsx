/**
 * CompanionRevealScreen Component
 *
 * Companion reveal screen for five-screen maximum onboarding.
 * Shows the user's companion creature with excitement and personality.
 * Single CTA to continue to session setup.
 *
 * @phase 4
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme/ThemeContext';
import { CompanionCreature } from './CompanionCreature';
import { Text as VexText } from '../../../components/primitives/Text';

interface CompanionRevealScreenProps {
  userName: string;
  onContinue: () => void;
  onBack?: () => void;
}

/**
 * Companion reveal screen
 */
export function CompanionRevealScreen({
  userName,
  onContinue,
  onBack,
}: CompanionRevealScreenProps): React.ReactNode {
  const { theme: _theme } = useTheme();
  const displayName = userName || 'there';

  return (
    <Box flex={1} bg="background.primary" px="lg" py="xl">
      {/* Header with Back Button */}
      <Box flexDirection="row" alignItems="center" mb="md">
        {onBack && (
          <Pressable
            onPress={onBack}
            style={{ marginRight: 12 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to previous screen"
          >
            <Box p="xs">
              <Text variant="h3" color="text.secondary">
                ‹
              </Text>
            </Box>
          </Pressable>
        )}
      </Box>

      {/* Header Content */}
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="sm" mb="xl">
          <Text variant="label" color="primary.500">
            Step 3 of 5
          </Text>
          <Text variant="h2" color="text.primary">
            Meet your companion, {displayName}!
          </Text>
          <Text variant="body" color="text.secondary">
            This little creature grows with every focus session you complete.
          </Text>
        </Box>
      </Animated.View>

      {/* Companion Reveal */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(200)}
        style={{ width: '100%' }}
      >
        <Box alignItems="center" py="xl">
          <CompanionCreature />
        </Box>
      </Animated.View>

      {/* Companion traits */}
      <Animated.View entering={FadeIn.duration(400).delay(600)}>
        <Box gap="sm" mt="lg">
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>🔥</Text>
            <Text variant="body" color="text.secondary">
              Grows stronger with each session
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>⚡</Text>
            <Text variant="body" color="text.secondary">
              Celebrates your streak milestones
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>💎</Text>
            <Text variant="body" color="text.secondary">
              Unlocks special cosmetics as you progress
            </Text>
          </Box>
        </Box>
      </Animated.View>

      {/* Spacer */}
      <Box flex={1} minHeight={40} />

      {/* CTA Button */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(800)}
        style={{ width: '100%' }}
      >
        <Button variant="primary"
          size="lg"
          fullWidth
          onPress={onContinue}
          accessibilityLabel="Continue to session setup"
          accessibilityRole="button"
          accessibilityHint="Double tap to select"
        >
          <VexText>Continue to session setup →</VexText>
        </Button>
      </Animated.View>

      {/* Back Option */}
      <Animated.View
        entering={FadeIn.duration(400).delay(900)}
        style={{ marginTop: 'auto' }}
      >
        <Pressable
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Double tap to select"
        >
          <Box alignItems="center" py="md">
            <Text variant="bodySmall" color="text.tertiary">
              ← Go back
            </Text>
          </Box>
        </Pressable>
      </Animated.View>
    </Box>
  );
}
