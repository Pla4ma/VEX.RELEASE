import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import {
  type DurationPickerProps,
  type DurationPreset,
  PRESETS,
} from './duration-picker-types';
import { DurationChip } from './DurationChip';
import { CustomDurationInput } from './CustomDurationInput';
import { XpEstimate } from './XpEstimate';

export type { DurationPickerProps, DurationPreset };

export function DurationPicker({
  selectedDuration,
  onDurationChange,
  streakMultiplier = 1,
  xpPerMinute = 2,
  isStrictMode = false,
  isLoading = false,
}: DurationPickerProps): React.ReactNode {
  const { theme } = useTheme();
  const [showCustom, setShowCustom] = React.useState(
    !PRESETS.includes(selectedDuration as DurationPreset),
  );
  if (isLoading) {
    return (
      <Box gap="md">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Box flexDirection="row" gap="sm">
            {PRESETS.map((preset) => (
              <Box
                key={preset}
                width={80}
                height={48}
                borderRadius="xl"
                bg={theme.colors.background.tertiary}
              />
            ))}
          </Box>
        </ScrollView>
        <Box
          height={60}
          borderRadius="lg"
          bg={theme.colors.background.tertiary}
        />
      </Box>
    );
  }
  return (
    <Box>
      <Text variant="label" color="text.secondary" mb="md">
        DURATION
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: theme.spacing[4] }}
      >
        <Box flexDirection="row">
          {PRESETS.map((preset) => (
            <DurationChip
              key={preset}
              minutes={preset}
              isSelected={selectedDuration === preset}
              onPress={() => {
                setShowCustom(false);
                onDurationChange(preset);
              }}
            />
          ))}
          <CustomDurationInput
            value={showCustom ? selectedDuration : null}
            onChange={(minutes) => {
              onDurationChange(minutes);
            }}
            isActive={showCustom}
            onActivate={() => setShowCustom(true)}
          />
        </Box>
      </ScrollView>

      <XpEstimate
        minutes={selectedDuration}
        xpPerMinute={xpPerMinute}
        streakMultiplier={streakMultiplier}
        isStrictMode={isStrictMode}
      />
    </Box>
  );
}