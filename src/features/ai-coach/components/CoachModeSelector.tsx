import React from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

export type CoachMode = 'gentle' | 'direct' | 'academic' | 'creative' | 'silent';

export const COACH_MODE_CONFIG: Record<CoachMode, { label: string; emoji: string; description: string }> = {
  gentle: {
    label: 'Gentle',
    emoji: '🌿',
    description: 'Encouraging, patient, and warm',
  },
  direct: {
    label: 'Direct',
    emoji: '⚡',
    description: 'No-nonsense, sharp, and actionable',
  },
  academic: {
    label: 'Academic',
    emoji: '🎓',
    description: 'Structured, evidence-based, and rigorous',
  },
  creative: {
    label: 'Creative',
    emoji: '🎨',
    description: 'Playful, imaginative, and unconventional',
  },
  silent: {
    label: 'Silent',
    emoji: '🧘',
    description: 'Only appears when you ask for help',
  },
};

interface CoachModeSelectorProps {
  selectedMode: CoachMode;
  onModeChange: (mode: CoachMode) => void;
}

export function CoachModeSelector({
  selectedMode,
  onModeChange,
}: CoachModeSelectorProps): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <Box gap="sm">
      <Text variant="label" color="text.secondary">
        Coach Style
      </Text>
      <Box flexDirection="row" flexWrap="wrap" gap="sm">
        {(Object.keys(COACH_MODE_CONFIG) as CoachMode[]).map((mode) => {
          const config = COACH_MODE_CONFIG[mode];
          const isSelected = selectedMode === mode;

          return (
            <Pressable
              key={mode}
              accessibilityLabel={`${config.label} coach mode`}
              accessibilityRole="button"
              accessibilityHint={config.description}
              onPress={() => onModeChange(mode)}
            >
              <Box
                px="md"
                py="sm"
                bg={isSelected ? 'semantic.surfaceElevated' : 'semantic.surfaceGlass'}
                borderRadius={16}
                style={{
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected
                    ? theme.colors.semantic.secondary
                    : theme.colors.semantic.liquidGlassBorder,
                  opacity: mode === 'silent' ? 0.8 : 1,
                }}
              >
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <Text variant="body" style={{ fontSize: 16 }}>
                    {config.emoji}
                  </Text>
                  <Text
                    variant="body"
                    color={isSelected ? 'text.primary' : 'text.secondary'}
                    style={{ fontWeight: isSelected ? '600' : '400' }}
                  >
                    {config.label}
                  </Text>
                </Box>
              </Box>
            </Pressable>
          );
        })}
      </Box>
    </Box>
  );
}
