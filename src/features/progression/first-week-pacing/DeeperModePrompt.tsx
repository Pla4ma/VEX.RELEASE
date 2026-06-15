import React, { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { MotivationProfileType } from '../../onboarding/schemas';
import { MODE_OPTIONS, ModeCard } from './ModeCard';

interface DeeperModePromptProps {
  onSelect: (mode: MotivationProfileType) => void;
  onContinueAsIs?: () => void;
}

export function DeeperModePrompt({
  onSelect,
  onContinueAsIs,
}: DeeperModePromptProps): React.ReactNode {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<MotivationProfileType | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const handleSelect = (mode: MotivationProfileType) => {
    if (isAdvancing) {return;}
    setSelected(mode);
    setIsAdvancing(true);
    setTimeout(() => {
      onSelect(mode);
    }, 400);
  };

  return (
    <Box flex={1} bg="background.primary">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: theme.spacing[6] }}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Box alignItems="center" gap="md" mb="xl">
            <Text fontSize={48}>🎯</Text>
            <Text
              variant="h1"
              color="text.primary"
              textAlign="center"
              fontWeight="800"
            >
              One week complete
            </Text>
            <Text variant="bodyLarge" color="text.secondary" textAlign="center">
              You completed 7 sessions. Your focus rhythm is real. Now choose
              what VEX becomes for you.
            </Text>
          </Box>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(400).delay(200)}>
          <Box gap="md" mb="xl">
            <Text variant="h3" color="text.primary" textAlign="center">
              Which path feels right?
            </Text>
            <Text variant="body" color="text.tertiary" textAlign="center">
              You can switch anytime in Settings. This just sets the starting
              tone.
            </Text>
          </Box>
        </Animated.View>

        {MODE_OPTIONS.map((option, index) => (
          <ModeCard
            key={option.key}
            option={option}
            isSelected={selected === option.key}
            onPress={() => handleSelect(option.key)}
            index={index}
          />
        ))}

        <Animated.View entering={FadeIn.duration(400).delay(800)}>
          {onContinueAsIs && (
            <Pressable
              onPress={onContinueAsIs}
              accessibilityLabel="Continue with current mode"
              accessibilityRole="button"
              accessibilityHint="Keeps your current motivation style"
            >
              <Box alignItems="center" py="lg">
                <Text variant="body" color="text.tertiary">
                  Continue as is ›
                </Text>
              </Box>
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>
    </Box>
  );
}

export default DeeperModePrompt;
