/**
 * FirstSessionSetup Component
 *
 * First session setup screen for five-screen maximum onboarding.
 * Combines focus time selection with session start CTA.
 * 10-minute starter session default, with other options available.
 *
 * @phase 4
 */

import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import type { FocusDuration, FocusGoal } from '../schemas';
import { DURATION_OPTIONS } from '../service';
import { DurationCard } from './DurationCard';
import { SessionPreview } from './SessionPreview';

interface FirstSessionSetupProps {
  userName: string;
  goal: FocusGoal | null;
  onStartSession: (config: { duration: number; category: FocusGoal | null }) => void;
  onBack?: () => void;
}

/**
 * First session setup screen
 */
export function FirstSessionSetup({ userName, goal, onStartSession, onBack }: FirstSessionSetupProps): JSX.Element {
  const { theme } = useTheme();
  const [selectedDuration, setSelectedDuration] = useState<FocusDuration>(10); // Default to 10 minutes
  const [isAdvancing, setIsAdvancing] = useState(false);

  const displayName = userName || 'there';

  const handleDurationSelect = (duration: FocusDuration) => {
    setSelectedDuration(duration);
  };

  const handleStartSession = () => {
    if (isAdvancing) {return;}

    setIsAdvancing(true);
    onStartSession({
      duration: selectedDuration,
      category: goal || null,
    });
  };

  return (
    <Box flex={1} bg="background.primary" px="lg" py="xl">
      {/* Header with Back Button */}
      <Box flexDirection="row" alignItems="center" mb="md">
        {onBack && (
          <Pressable onPress={onBack} style={{ marginRight: 12 }}>
            <Box p="xs">
              <Text variant="h3" color="text.secondary">‹</Text>
            </Box>
          </Pressable>
        )}
      </Box>

      {/* Header Content */}
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="sm" mb="xl">
          <Text variant="label" color="primary.500">
            Step 4 of 5
          </Text>
          <Text variant="h2" color="text.primary">
            Let's do your first session, {displayName}!
          </Text>
          <Text variant="body" color="text.secondary">
            Choose your session length. We recommend starting with 10 minutes.
          </Text>
        </Box>
      </Animated.View>

      {/* Duration Options */}
      <Animated.View entering={FadeInUp.duration(500).delay(200)} style={{ width: '100%' }}>
        <Box
          flexDirection="row"
          flexWrap="wrap"
          gap="md"
          justifyContent="center"
          mb="lg"
        >
          {DURATION_OPTIONS.map((option, index) => (
            <DurationCard
              key={option.value}
              option={option}
              isSelected={selectedDuration === option.value}
              onPress={() => handleDurationSelect(option.value)}
              index={index}
              isRecommended={option.value === 10}
            />
          ))}
        </Box>
      </Animated.View>

      {/* Session Preview */}
      <Animated.View entering={FadeInUp.duration(400).delay(400)} style={{ width: '100%' }}>
        <SessionPreview duration={selectedDuration} goal={goal ?? ''} />
      </Animated.View>

      {/* Benefits list */}
      <Animated.View entering={FadeIn.duration(400).delay(600)}>
        <Box gap="sm" mt="lg">
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>🔥</Text>
            <Text variant="body" color="text.secondary">
              Start your streak today
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>⚡</Text>
            <Text variant="body" color="text.secondary">
              Earn XP and level up
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text fontSize={16}>📈</Text>
            <Text variant="body" color="text.secondary">
              See your Focus Score change
            </Text>
          </Box>
        </Box>
      </Animated.View>

      {/* Spacer */}
      <Box flex={1} minHeight={20} />

      {/* CTA Button */}
      <Animated.View entering={FadeInUp.duration(400).delay(800)} style={{ width: '100%' }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleStartSession}
          disabled={isAdvancing}
          accessibilityLabel="Start focus session → button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          {isAdvancing ? 'Starting...' : `Start ${selectedDuration}-minute focus session →`}
        </Button>
      </Animated.View>

      {/* Back Option */}
      <Animated.View entering={FadeIn.duration(400).delay(900)} style={{ marginTop: 'auto' }}>
        <Pressable onPress={onBack}
          accessibilityLabel="← Go back button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
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

export default FirstSessionSetup;
