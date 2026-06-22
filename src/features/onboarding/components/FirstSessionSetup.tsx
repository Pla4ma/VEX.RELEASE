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
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { FocusDuration, FocusGoal } from '../schemas';
import { DURATION_OPTIONS } from '../service';
import { DurationCard } from './DurationCard';
import { SessionPreview } from './SessionPreview';
import { FirstSessionCta } from './FirstSessionCta';

interface FirstSessionSetupProps {
  userName: string;
  goal: FocusGoal | null;
  onStartSession: (config: {
    duration: number;
    category: FocusGoal | null;
  }) => void;
  onBack?: () => void;
}

/**
 * First session setup screen
 */
export function FirstSessionSetup({
  userName,
  goal,
  onStartSession,
  onBack,
}: FirstSessionSetupProps): React.ReactNode {
  const { theme: _theme } = useTheme();
  const [selectedDuration, setSelectedDuration] = useState<FocusDuration>(10);
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
              <Text variant="h3" color="text.secondary">‹</Text>
            </Box>
          </Pressable>
        )}
        <Text variant="h2" color="text.primary">
          First focus session
        </Text>
      </Box>

      <Animated.View entering={FadeInUp.duration(400).delay(200)}>
        <Text variant="body" color="text.secondary" mb="lg">
          Welcome, {displayName}. Let's start with a short focus session.
          You can always adjust later.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(400)}>
        <Text variant="label" color="text.secondary" mb="sm">
          Choose your focus duration
        </Text>
        <Box flexDirection="row" flexWrap="wrap" gap="sm" mb="lg">
          {DURATION_OPTIONS.map((option, index) => (
            <DurationCard
              key={option.value}
              option={option}
              isSelected={selectedDuration === option.value}
              onPress={() => handleDurationSelect(option.value)}
              index={index}
            />
          ))}
        </Box>
      </Animated.View>

      {selectedDuration != null ? (
        <SessionPreview duration={selectedDuration!} goal={goal ?? ''} />
      ) : null}

      <Animated.View entering={FadeInUp.duration(400).delay(600)}>
        <Box p="md" mb="md" borderRadius="lg" bg="background.secondary">
          <Box flexDirection="row" alignItems="center" gap="sm" mb="xs">
            <Text fontSize={16}>✨</Text>
            <Text variant="body" color="text.secondary">
              Your system adapts from real progress
            </Text>
          </Box>
        </Box>
      </Animated.View>

      <FirstSessionCta
        selectedDuration={selectedDuration}
        isAdvancing={isAdvancing}
        onStartSession={handleStartSession}
        onBack={onBack || (() => {})}
      />
    </Box>
  );
}
