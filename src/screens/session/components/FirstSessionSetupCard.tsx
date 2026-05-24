import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { SessionMode } from '../../../session/modes';
import type { FirstSessionPersonalization } from '../hooks/useFirstSessionPersonalization';

type FirstSessionSetupCardProps = {
  personalization: FirstSessionPersonalization;
  isStarting: boolean;
  onStart: (config: { mode: SessionMode; durationMinutes: number; goal?: string }) => void;
};

const FIRST_SESSION_MODES = [
  { mode: SessionMode.STUDY, label: 'Study', icon: 'open-book', description: 'With material to review' },
  { mode: SessionMode.LIGHT_FOCUS, label: 'Focus', icon: 'target', description: 'Standard focused work' },
  { mode: SessionMode.DEEP_WORK, label: 'Deep Work', icon: 'brain', description: 'No interruptions, high intensity' },
] as const;

function CoachLine({ text }: { text: string }): JSX.Element | null {
  const { theme } = useTheme();
  if (!text) return null;

  return (
    <Box
      p="md"
      mt="md"
      bg="background.secondary"
      borderRadius="lg"
      borderWidth={1}
      borderColor="border.light"
    >
      <Text variant="caption" color="text.secondary" textAlign="center">
        {text}
      </Text>
    </Box>
  );
}

function CompanionVisual({ element }: { element: string | null }): JSX.Element | null {
  if (!element) return null;

  const elementEmoji: Record<string, string> = {
    FLAME: '🔥',
    WAVE: '🌊',
    TERRA: '🌍',
    ZEPHYR: '💨',
    VOID: '🌑',
    LUMINA: '✨',
  };

  return (
    <Box alignItems="center" py="md">
      <Text fontSize={40}>{elementEmoji[element] ?? '💎'}</Text>
      <Text variant="caption" color="text.tertiary" mt="xs">
        Your companion is ready
      </Text>
    </Box>
  );
}

function StudyTarget({
  visible,
  target,
  onChange,
}: {
  visible: boolean;
  target: string;
  onChange: (value: string) => void;
}): JSX.Element | null {
  if (!visible) return null;

  return (
    <Animated.View entering={FadeInDown.duration(250)}>
      <Box
        p="md"
        mt="md"
        bg="background.secondary"
        borderRadius="lg"
        borderWidth={1}
        borderColor="border.light"
      >
        <Text variant="label" color="text.secondary" mb="sm">
          What are you studying today?
        </Text>
        <Text variant="body" color="text.primary">
          {target || 'Tap to set a study target'}
        </Text>
      </Box>
    </Animated.View>
  );
}

export function FirstSessionSetupCard({
  personalization,
  isStarting,
  onStart,
}: FirstSessionSetupCardProps): JSX.Element {
  const { theme } = useTheme();
  const defaultMode = personalization.defaultMode;
  const [selectedMode, setSelectedMode] = useState<SessionMode>(defaultMode);
  const [studyTarget, setStudyTarget] = useState('');
  const showStudyTarget = selectedMode === SessionMode.STUDY;

  const handleStart = () => {
    onStart({
      mode: selectedMode,
      durationMinutes: personalization.suggestedDurationMinutes,
      goal: showStudyTarget ? studyTarget || 'Study session' : undefined,
    });
  };

  return (
    <Box px="lg" mt="lg">
      <Box
        p="lg"
        bg="background.secondary"
        borderRadius="xl"
        borderWidth={1}
        borderColor={theme.colors.primary[500]}
        gap="lg"
      >
        <Box gap="xs">
          <Text variant="label" color="primary.500">
            Your first session
          </Text>
          <Text variant="h4" color="text.primary">
            Choose your focus mode
          </Text>
          <Text variant="body" color="text.secondary">
            Pick one. You can always switch later.
          </Text>
        </Box>

        <Box gap="sm">
          {FIRST_SESSION_MODES.map((item) => {
            const isSelected = selectedMode === item.mode;
            return (
              <Pressable
                key={item.mode}
                onPress={() => setSelectedMode(item.mode)}
                accessibilityLabel={`Select ${item.label} mode: ${item.description}`}
                accessibilityRole="radio"
                accessibilityHint={`Sets session mode to ${item.label}`}
                accessibilityState={{ selected: isSelected }}
                style={{
                  padding: theme.spacing[3],
                  borderRadius: theme.borderRadius.lg,
                  borderWidth: 2,
                  borderColor: isSelected
                    ? theme.colors.primary[500]
                    : theme.colors.border.light,
                  backgroundColor: isSelected
                    ? `${theme.colors.primary[500]}10`
                    : theme.colors.background.primary,
                }}
              >
                <Box flexDirection="row" alignItems="center" gap="md">
                  <Box
                    width={44}
                    height={44}
                    borderRadius="full"
                    bg={isSelected ? `${theme.colors.primary[500]}20` : 'background.primary'}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text fontSize={20}>{item.icon === 'open-book' ? '📚' : item.icon === 'target' ? '🎯' : '🧠'}</Text>
                  </Box>
                  <Box flex={1}>
                    <Text variant="label" color="text.primary">
                      {item.label}
                    </Text>
                    <Text variant="caption" color="text.secondary">
                      {item.description}
                    </Text>
                  </Box>
                  {isSelected ? (
                    <Box
                      width={24}
                      height={24}
                      borderRadius="full"
                      bg="primary.500"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text fontSize={14} color="white">✓</Text>
                    </Box>
                  ) : null}
                </Box>
              </Pressable>
            );
          })}
        </Box>

        <Box
          p="md"
          bg="background.primary"
          borderRadius="lg"
          borderWidth={1}
          borderColor="border.light"
          gap="xs"
        >
          <Text variant="caption" color="text.tertiary">
            Suggested duration
          </Text>
          <Box flexDirection="row" alignItems="baseline" gap="xs">
            <Text variant="h3" color="primary.500">
              {personalization.suggestedDurationMinutes}
            </Text>
            <Text variant="body" color="text.secondary">
              minutes
            </Text>
          </Box>
          <Text variant="caption" color="text.tertiary">
            {personalization.durationLabel}
          </Text>
        </Box>

        <CompanionVisual element={personalization.companionElement} />

        <StudyTarget
          visible={showStudyTarget}
          target={studyTarget}
          onChange={setStudyTarget}
        />

        <CoachLine text={personalization.coachLine} />

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleStart}
          isLoading={isStarting}
          accessibilityLabel={`Start ${selectedMode} session for ${personalization.suggestedDurationMinutes} minutes`}
          accessibilityRole="button"
          accessibilityHint="Begins your first focus session"
        >
          {`Start ${personalization.suggestedDurationMinutes}-min session`}
        </Button>
      </Box>
    </Box>
  );
}

export default FirstSessionSetupCard;
